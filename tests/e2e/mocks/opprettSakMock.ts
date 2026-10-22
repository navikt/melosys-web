import { Page, Route } from "@playwright/test";

/**
 * Mocker alle API- og GraphQL-kall for «Opprett ny sak/behandling» for en bruker uten eksisterende saker,
 * med lovlige kombinasjoner for EU/EØS-land og Medlemskap og lovvalg.
 *
 * Etter opprettelse navigerer appen til forsiden, som får en tom oppgaveoversikt.
 */

export const BRUKER_ID = "30056928150";

export interface OpprettSakRequest {
  sakstype: string;
  behandlingstema: string;
  soknadDto: {
    periode: { fom: string | null; tom: string | null };
    land: { landkoder: string[]; flereLandUkjentHvilke: boolean };
  };
}

export interface OpprettSakMock {
  url: string;
  /** Request-body fra siste «Opprett ny behandling», eller null hvis saken ikke er opprettet */
  opprettetSak: () => OpprettSakRequest | null;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

const GET_RESPONSER: Record<string, unknown> = {
  "/api/featuretoggle": {},
  "/api/kodeverk/nav-felles/LANDKODER_ISO2": [],
  "/api/oppgaver/oversikt": { journalforing: [], saksbehandling: [] },
  "/api/saksbehandling/sakstyper/hent-lovlige-kombinasjoner/": [
    { kode: "EU_EOS", term: "EU/EØS-land" },
    { kode: "TRYGDEAVTALE", term: "Avtaleland" },
    { kode: "FTRL", term: "Utenfor avtaleland" },
  ],
  "/api/saksbehandling/sakstemaer/hent-lovlige-kombinasjoner/": [
    { kode: "MEDLEMSKAP_LOVVALG", term: "Medlemskap og lovvalg" },
    { kode: "UNNTAK", term: "Unntak" },
    { kode: "TRYGDEAVGIFT", term: "Trygdeavgift" },
  ],
  "/api/saksbehandling/behandlingstemaer/hent-lovlige-kombinasjoner/": [
    { kode: "UTSENDT_ARBEIDSTAKER", term: "Utsendt arbeidstaker / skip / direkte til artikkel 16" },
    { kode: "ARBEID_FLERE_LAND", term: "Arbeid og/eller selvstendig virksomhet i flere land" },
  ],
  "/api/saksbehandling/behandlingstyper/kombinasjoner-for-ny-sak/": [
    { kode: "FØRSTEGANG", term: "Førstegangsbehandling" },
    { kode: "KLAGE", term: "Klage" },
  ],
  "/api/saksbehandling/behandlingsaarsaktyper/hent-lovlige-kombinasjoner/": [
    { kode: "SØKNAD", term: "Søknad" },
    { kode: "SED", term: "SED" },
  ],
};

const GRAPHQL_RESPONSER: Record<string, unknown> = {
  hentNavn: {
    data: {
      hentPersonopplysninger: {
        navn: { fornavn: "KARAFFEL", mellomnavn: null, etternavn: "TRIVIELL", __typename: "Navn" },
        __typename: "Personopplysninger",
      },
    },
  },
};

async function svarJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
}

export async function mockOpprettSak(page: Page): Promise<OpprettSakMock> {
  const ikkeMockedeKall: string[] = [];
  let opprettetSak: OpprettSakRequest | null = null;

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (method === "GET" && pathname in GET_RESPONSER) {
        return svarJson(route, GET_RESPONSER[pathname]);
      }

      if (method === "POST" && pathname === "/api/fagsaker/sok") {
        return svarJson(route, []);
      }

      if (method === "POST" && pathname === "/api/fagsaker") {
        opprettetSak = request.postDataJSON() as OpprettSakRequest;
        return route.fulfill({ status: 204 });
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await page.route(
    (url) => /^\/graphql\/?$/.test(url.pathname),
    async (route) => {
      const { operationName } = route.request().postDataJSON() as { operationName: string };
      if (operationName in GRAPHQL_RESPONSER) {
        return svarJson(route, GRAPHQL_RESPONSER[operationName]);
      }
      ikkeMockedeKall.push(`graphql ${operationName}`);
      return route.fulfill({ status: 404, body: `Ingen mock for graphql ${operationName}` });
    },
  );

  return {
    url: "/melosys/opprettnysak",
    opprettetSak: () => opprettetSak,
    ikkeMockedeKall,
  };
}
