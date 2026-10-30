import { Page } from "@playwright/test";
import fixture from "./trygdeavtale.json" with { type: "json" };
import { mockGraphql, svarJson } from "./mockUtils";

/**
 * Mocker alle API-, GraphQL- og flyt-kall for en trygdeavtale-behandling (Avtaleland, Yrkesaktiv)
 * fra Inngang til og med Bestemmelse.
 *
 * Flyt-tjenesten (`/trygdeavtale-flyt/`) etterlignes med en forenklet versjon av logikken i melosys-trygdeavtale:
 * - Inngang er ferdig når periode og et land med støtte er lagret i mottatte opplysninger
 * - Virksomheter vises først etter at registeropplysninger er hentet
 * - Bestemmelser vises når vedtak er «Jeg vil innvilge søknaden», og steget er ferdig når bestemmelse er valgt
 * - Tilleggsbestemmelse vises for Canada når bestemmelsen er artikkel 6 nr. 2 eller artikkel 7
 *
 * Familie og Vedtak er ikke med i flyten.
 */

export interface Resultat {
  virksomhet?: string | null;
  vedtak?: string | null;
  bestemmelse?: string | null;
  tilleggsbestemmelse?: string | null;
  [felt: string]: unknown;
}

export interface Periode {
  fom: string | null;
  tom: string | null;
}

export interface MottatteOpplysningerRequest {
  data: { periode: Periode; soeknadsland: { landkoder: string[]; flereLandUkjentHvilke: boolean } };
}

export interface TrygdeavtaleMock {
  url: string;
  /** Alle `resultat` sendt med PUT til flyt-tjenesten, i rekkefølge */
  flytLagringer: Resultat[];
  /** Alle lagringer av mottatte opplysninger, i rekkefølge */
  mottatteOpplysningerLagringer: MottatteOpplysningerRequest[];
  /** Antall ganger registeropplysninger er hentet på nytt */
  antallOppfriskninger: () => number;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

interface Options {
  /** Start med periode 01.01.2026–31.12.2026, arbeidsland Canada og hentede registeropplysninger */
  utfylt?: boolean;
  /** Lagret resultat i flyten ved oppstart */
  resultat?: Partial<Resultat>;
}

const TILLEGGSBESTEMMELSE_FOR = ["CAN_ART6_2", "CAN_ART7"];

export async function mockTrygdeavtale(
  page: Page,
  { utfylt = false, resultat = {} }: Options = {},
): Promise<TrygdeavtaleMock> {
  const { saksnummer, behandlingID, graphql, behandling, flyt } = fixture;
  const getResponser: Record<string, unknown> = structuredClone(fixture.get);
  const mottatteOpplysningerPath = `/api/mottatteopplysninger/${behandlingID}`;
  const mottatteOpplysninger = getResponser[mottatteOpplysningerPath] as MottatteOpplysningerRequest;
  const flytPath = `/trygdeavtale-flyt/${behandlingID}`;

  let registeropplysningerHentet = utfylt;
  let antallOppfriskninger = 0;
  if (utfylt) {
    mottatteOpplysninger.data.periode = { fom: "2026-01-01", tom: "2026-12-31" };
    mottatteOpplysninger.data.soeknadsland = { landkoder: ["CA"], flereLandUkjentHvilke: false };
  }
  let lagretResultat: Resultat = { ...flyt.resultat, ...resultat };

  const flytLagringer: Resultat[] = [];
  const mottatteOpplysningerLagringer: MottatteOpplysningerRequest[] = [];
  const ikkeMockedeKall: string[] = [];

  const lagFlyt = () => {
    const { periode, soeknadsland } = mottatteOpplysninger.data;
    const landkode = soeknadsland.landkoder[0];
    const land = [...flyt.data.landValg, ...flyt.data.landValgUtenStøtte].find(({ kode }) => kode === landkode);
    const inngangFerdig = Boolean(periode.fom) && flyt.data.landValg.some(({ kode }) => kode === landkode);
    const virksomhetFerdig = inngangFerdig && Boolean(lagretResultat.virksomhet);
    const erInnvilgelse = lagretResultat.vedtak === "JA_FATTE_VEDTAK";
    const bestemmelseFerdig = virksomhetFerdig && erInnvilgelse && Boolean(lagretResultat.bestemmelse);
    const status = (ferdig: boolean) => (ferdig ? "FERDIG" : "IKKE_FERDIG");

    const steg = [{ navn: "INNGANG", status: status(inngangFerdig), nummer: 0 }];
    if (inngangFerdig) steg.push({ navn: "AVKLAR_VIRKSOMHET", status: status(virksomhetFerdig), nummer: 1 });
    if (virksomhetFerdig) steg.push({ navn: "BESTEMMELSE", status: status(bestemmelseFerdig), nummer: 2 });

    return {
      steg,
      resultat: { ...lagretResultat, lovvalgsperiodeFom: periode.fom, lovvalgsperiodeTom: periode.tom },
      data: {
        ...flyt.data,
        periodeFom: periode.fom,
        periodeTom: periode.tom,
        soeknadsland: land ?? null,
        virksomheter: registeropplysningerHentet ? flyt.virksomheter : [],
        bestemmelseValg: erInnvilgelse ? flyt.bestemmelseValg : [],
        tilleggsbestemmelseValg:
          landkode === "CA" && TILLEGGSBESTEMMELSE_FOR.includes(lagretResultat.bestemmelse ?? "")
            ? flyt.tilleggsbestemmelseValg
            : null,
      },
    };
  };

  await page.route(
    (url) => url.pathname.startsWith("/api/") || url.pathname.startsWith("/trygdeavtale-flyt/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (pathname === flytPath && method === "GET") {
        return svarJson(route, lagFlyt());
      }

      if (pathname === flytPath && method === "PUT") {
        lagretResultat = (request.postDataJSON() as { resultat: Resultat }).resultat;
        flytLagringer.push(lagretResultat);
        return svarJson(route, lagFlyt());
      }

      if (pathname === `${flytPath}/oppfrisk` && method === "PUT") {
        return svarJson(route, lagFlyt());
      }

      if (method === "GET" && pathname === `/api/saksopplysninger/oppfriskning/${behandlingID}`) {
        registeropplysningerHentet = true;
        antallOppfriskninger++;
        return route.fulfill({ status: 204 });
      }

      if (method === "GET" && pathname === `/api/behandlinger/${behandlingID}`) {
        return svarJson(route, registeropplysningerHentet ? behandling.etterOppfrisk : behandling.førOppfrisk);
      }

      if (method === "GET" && pathname in getResponser) {
        return svarJson(route, getResponser[pathname]);
      }

      if (method === "POST" && pathname === mottatteOpplysningerPath) {
        const lagring = request.postDataJSON() as MottatteOpplysningerRequest;
        mottatteOpplysningerLagringer.push(lagring);
        mottatteOpplysninger.data = lagring.data;
        return svarJson(route, mottatteOpplysninger);
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await mockGraphql(page, graphql, ikkeMockedeKall);

  return {
    url: `/melosys/TRYGDEAVTALE/saksbehandling/${saksnummer}?behandlingID=${behandlingID}`,
    flytLagringer,
    mottatteOpplysningerLagringer,
    antallOppfriskninger: () => antallOppfriskninger,
    ikkeMockedeKall,
  };
}
