import { Page } from "@playwright/test";
import { mockGraphql, svarJson } from "./mockUtils";

/**
 * Mocker API-kallene på forsiden for saksplukkeren («Behandle sak»), med lovlige kombinasjoner
 * for EU/EØS og Avtaleland. Svaret på plukk settes per test med `settPlukkSvar`.
 */

export interface PlukkRequest {
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
}

export interface PlukkSvar {
  saksnummer?: string;
  behandlingID?: number;
  behandlingstema?: string;
  behandlingstype?: string;
  antallUtildelteOppgaver?: number;
}

export interface SaksplukkerMock {
  /** Request-body fra siste «Behandle sak», eller null hvis det ikke er plukket */
  plukk: () => PlukkRequest | null;
  settPlukkSvar: (svar: PlukkSvar) => void;
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
  ],
  "/api/saksbehandling/sakstemaer/hent-lovlige-kombinasjoner/": [
    { kode: "MEDLEMSKAP_LOVVALG", term: "Medlemskap og lovvalg" },
    { kode: "UNNTAK", term: "Unntak" },
  ],
  "/api/saksbehandling/behandlingstemaer/hent-lovlige-kombinasjoner/": [
    { kode: "UTSENDT_ARBEIDSTAKER", term: "Utsendt arbeidstaker" },
    { kode: "ARBEID_FLERE_LAND", term: "Arbeid i flere land" },
  ],
};

export async function mockSaksplukker(page: Page): Promise<SaksplukkerMock> {
  const ikkeMockedeKall: string[] = [];
  let plukk: PlukkRequest | null = null;
  let plukkSvar: PlukkSvar = {};

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (method === "GET" && pathname in GET_RESPONSER) {
        return svarJson(route, GET_RESPONSER[pathname]);
      }

      if (method === "POST" && pathname === "/api/oppgaver/plukk") {
        plukk = request.postDataJSON() as PlukkRequest;
        return svarJson(route, plukkSvar);
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await mockGraphql(page, {}, ikkeMockedeKall);

  return {
    plukk: () => plukk,
    settPlukkSvar: (svar) => {
      plukkSvar = svar;
    },
    ikkeMockedeKall,
  };
}
