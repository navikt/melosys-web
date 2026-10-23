import { Page } from "@playwright/test";
import fixture from "./eu-eos-vurder-utpeking.json" with { type: "json" };
import { mockGraphql, svarJson } from "./eosBehandlingMock";

/**
 * Mocker alle API- og GraphQL-kall for en EU/EØS-behandling «Beslutning om lovvalg i et annet land – A003»
 * der Sverige er utpekt med grunnlag art. 87(8), slik at det må velges nøyaktig én overgangsregel.
 *
 * Fixturen har ingen lagrede overgangsregler. Bruk `overgangsregelbestemmelser` for å starte med lagrede valg.
 */

export interface MottatteOpplysningerRequest {
  data: { overgangsregelbestemmelser: string[] };
}

export interface Kodeverk {
  kode: string;
  term: string;
}

export interface EosVurderUtpekingMock {
  url: string;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

export async function mockEosVurderUtpeking(
  page: Page,
  { overgangsregelbestemmelser = [] }: { overgangsregelbestemmelser?: Kodeverk[] } = {},
): Promise<EosVurderUtpekingMock> {
  const { saksnummer, behandlingID, graphql } = fixture;
  const getResponser: Record<string, unknown> = structuredClone(fixture.get);
  const mottatteOpplysningerPath = `/api/mottatteopplysninger/${behandlingID}`;
  const mottatteOpplysninger = getResponser[mottatteOpplysningerPath] as { data: Record<string, unknown> };
  mottatteOpplysninger.data.overgangsregelbestemmelser = overgangsregelbestemmelser;
  const ikkeMockedeKall: string[] = [];

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (method === "GET" && pathname in getResponser) {
        return svarJson(route, getResponser[pathname]);
      }

      // Backend returnerer et beriket objekt for mottatteopplysninger, så vi svarer med lagret GET-respons
      if (method === "POST" && pathname === mottatteOpplysningerPath) {
        return svarJson(route, getResponser[pathname]);
      }

      if (method === "POST" && pathname in getResponser) {
        return svarJson(route, request.postDataJSON());
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await mockGraphql(page, graphql, ikkeMockedeKall);

  return {
    url: `/melosys/EU_EOS/vurderutpeking/${saksnummer}/?behandlingID=${behandlingID}`,
    ikkeMockedeKall,
  };
}
