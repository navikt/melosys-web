import { Page } from "@playwright/test";
import fixture from "./send-brev.json" with { type: "json" };
import { EosBehandlingMock, mockEosUtsendtArbeidstaker } from "./eosBehandlingMock";
import { svarJson } from "./mockUtils";

/**
 * Mocker «Send brev»-fanen oppå en EU/EØS-behandling (Utsendt arbeidstaker).
 *
 * Maler, mulige mottakere, organisasjon og norske myndigheter er hentet fra lokal melosys-api.
 * Bestillinger (send brev og lagre/oppdater/slett utkast) fanges i `bestillinger` slik at testene
 * kan verifisere payload. Utkast holdes i en enkel state som speiler backend: tittel er
 * dokumenttittel eller malens navn, og produserbardokument returneres som kodeverk-objekt.
 */

export interface Bestilling {
  method: string;
  path: string;
  body: Record<string, unknown> | null;
}

interface Utkast {
  utkastBrevID: number;
  lagretAvSaksbehandlerIdent: string;
  tittel: string;
  brevbestilling: Record<string, unknown>;
}

export interface SendBrevMock extends EosBehandlingMock {
  bestillinger: Bestilling[];
  leggTilUtkast: (brevbestilling: Record<string, unknown>, lagretAv?: string) => Utkast;
}

type Maler = { brevTyper: { type: { kode: string; term: string } }[] }[];

const malNavn = (kode: string) =>
  (fixture.get["/api/dokumenter/v2/tilgjengelige-maler/9001"] as Maler)
    .flatMap((mal) => mal.brevTyper)
    .find((brevType) => brevType.type.kode === kode)?.type.term ?? kode;

export async function mockSendBrev(page: Page): Promise<SendBrevMock> {
  const base = await mockEosUtsendtArbeidstaker(page);
  const { behandlingID } = base;
  const getResponser: Record<string, unknown> = structuredClone(fixture.get);
  const muligeMottakere: Record<string, unknown> = fixture.muligeMottakere;
  const norskeMyndigheter = fixture.get["/api/dokumenter/v2/tilgjengelige-norske-myndigheter"];
  const bestillinger: Bestilling[] = [];
  let utkast: Utkast[] = [];
  let nesteUtkastID = 1;

  const leggTilUtkast = (brevbestilling: Record<string, unknown>, lagretAv = "Z990693"): Utkast => {
    const kode = String(brevbestilling.produserbardokument);
    const nytt: Utkast = {
      utkastBrevID: nesteUtkastID++,
      lagretAvSaksbehandlerIdent: lagretAv,
      tittel: (brevbestilling.dokumentTittel as string) || malNavn(kode),
      brevbestilling: { ...brevbestilling, produserbardokument: { kode, term: malNavn(kode) } },
    };
    utkast = [...utkast, nytt];
    return nytt;
  };

  const utkastPath = `/api/brev/utkast/${behandlingID}`;

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();
      const body = () => request.postDataJSON() as Record<string, unknown>;

      if (method === "GET" && pathname in getResponser) {
        return svarJson(route, getResponser[pathname]);
      }

      if (method === "GET" && pathname === utkastPath) {
        return svarJson(route, utkast);
      }

      if (method === "POST" && pathname === `/api/dokumenter/v2/mulige-mottakere/${behandlingID}`) {
        const { produserbartdokument } = body();
        if (String(produserbartdokument) in muligeMottakere) {
          return svarJson(route, muligeMottakere[String(produserbartdokument)]);
        }
      }

      if (method === "POST" && pathname === `/api/dokumenter/v2/mulige-mottakere-norske-myndigheter/${behandlingID}`) {
        const { produserbartdokument, orgnrNorskMyndighet } = body() as {
          produserbartdokument: string;
          orgnrNorskMyndighet: string[];
        };
        return svarJson(
          route,
          norskeMyndigheter
            .filter(({ orgnr }) => orgnrNorskMyndighet.includes(orgnr))
            .map(({ navn, orgnr }) => ({
              mottakerNavn: navn,
              dokumentNavn: malNavn(produserbartdokument),
              rolle: "NORSK_MYNDIGHET",
              orgnr,
              aktørId: null,
              institusjonID: null,
            })),
        );
      }

      if (method === "POST" && pathname === `/api/dokumenter/v2/opprett/${behandlingID}`) {
        bestillinger.push({ method, path: pathname, body: body() });
        return route.fulfill({ status: 204 });
      }

      if (method === "POST" && pathname === utkastPath) {
        bestillinger.push({ method, path: pathname, body: body() });
        leggTilUtkast(body());
        return route.fulfill({ status: 204 });
      }

      const utkastMatch = pathname.match(new RegExp(`^${utkastPath}/(\\d+)$`));
      if (utkastMatch && (method === "PUT" || method === "DELETE")) {
        const utkastBrevID = Number(utkastMatch[1]);
        bestillinger.push({ method, path: pathname, body: method === "PUT" ? body() : null });
        if (method === "DELETE") {
          utkast = utkast.filter((u) => u.utkastBrevID !== utkastBrevID);
        } else {
          const kode = String(body().produserbardokument);
          utkast = utkast.map((u) =>
            u.utkastBrevID === utkastBrevID
              ? { ...u, brevbestilling: { ...body(), produserbardokument: { kode, term: malNavn(kode) } } }
              : u,
          );
        }
        return route.fulfill({ status: 204 });
      }

      return route.fallback();
    },
  );

  return { ...base, bestillinger, leggTilUtkast };
}
