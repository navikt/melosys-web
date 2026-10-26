import { Page } from "@playwright/test";
import fixture from "./eu-eos-arbeid-flere-land.json" with { type: "json" };
import { mockGraphql, svarJson } from "./mockUtils";
import type { MottatteOpplysningerRequest, Soeknadsland } from "./ftrlInngangMock";

/**
 * Mocker alle API- og GraphQL-kall for en EU/EØS-behandling (Arbeid i flere land) i saksbehandlingen,
 * inkludert autolagring av mottatte opplysninger og oppfrisking av registeropplysninger fra menypanelet.
 *
 * Fixturen har periode og søknadsland Sverige og Finland.
 */

export interface EuEosArbeidFlereLandMock {
  url: string;
  /** Søknadsland i siste lagring av mottatte opplysninger */
  lagretSoeknadsland: () => Soeknadsland;
  antallOppfriskninger: () => number;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

export async function mockEuEosArbeidFlereLand(page: Page): Promise<EuEosArbeidFlereLandMock> {
  const { saksnummer, behandlingID, graphql } = fixture;
  const getResponser: Record<string, unknown> = structuredClone(fixture.get);
  const mottatteOpplysningerPath = `/api/mottatteopplysninger/${behandlingID}`;
  const mottatteOpplysninger = getResponser[mottatteOpplysningerPath] as {
    data: MottatteOpplysningerRequest["data"];
  };
  const ikkeMockedeKall: string[] = [];
  let antallOppfriskninger = 0;

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (method === "GET" && pathname === `/api/saksopplysninger/oppfriskning/${behandlingID}`) {
        antallOppfriskninger++;
        return route.fulfill({ status: 204 });
      }

      if (method === "GET" && pathname in getResponser) {
        return svarJson(route, getResponser[pathname]);
      }

      if (method === "POST" && pathname === mottatteOpplysningerPath) {
        mottatteOpplysninger.data = (request.postDataJSON() as MottatteOpplysningerRequest).data;
        return svarJson(route, mottatteOpplysninger);
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await mockGraphql(page, graphql, ikkeMockedeKall);

  return {
    url: `/melosys/EU_EOS/saksbehandling/${saksnummer}?behandlingID=${behandlingID}`,
    lagretSoeknadsland: () => mottatteOpplysninger.data.soeknadsland,
    antallOppfriskninger: () => antallOppfriskninger,
    ikkeMockedeKall,
  };
}
