import { Page, Route } from "@playwright/test";
import fixture from "./ftrl-inngang.json" with { type: "json" };

/**
 * Mocker alle API- og GraphQL-kall for en FTRL-behandling (Utenfor avtaleland, Yrkesaktiv) på Inngang-steget,
 * inkludert lagring og oppfrisking av registeropplysninger ved «Bekreft og fortsett».
 *
 * Fixturen har registeropplysninger hentet og søknadsland Kina og Japan. Bruk `landkoder` for å starte med andre land.
 */

export interface Soeknadsland {
  landkoder: string[];
  flereLandUkjentHvilke: boolean;
}

export interface MottatteOpplysningerRequest {
  data: { soeknadsland: Soeknadsland };
}

export interface ArbeidslandRequest {
  arbeidsland: string[];
}

export interface FtrlInngangMock {
  url: string;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

async function svarJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
}

export async function mockFtrlInngang(
  page: Page,
  { landkoder = ["CN", "JP"] }: { landkoder?: string[] } = {},
): Promise<FtrlInngangMock> {
  const { saksnummer, behandlingID, graphql } = fixture;
  const getResponser: Record<string, unknown> = structuredClone(fixture.get);
  const postResponser: Record<string, unknown> = fixture.post;
  const mottatteOpplysningerPath = `/api/mottatteopplysninger/${behandlingID}`;
  const mottatteOpplysninger = getResponser[mottatteOpplysningerPath] as { data: Record<string, unknown> };
  mottatteOpplysninger.data.soeknadsland = { landkoder, flereLandUkjentHvilke: false };
  const ikkeMockedeKall: string[] = [];

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (method === "GET" && pathname === `/api/saksopplysninger/oppfriskning/${behandlingID}`) {
        return route.fulfill({ status: 204 });
      }

      if (method === "GET" && pathname in getResponser) {
        return svarJson(route, getResponser[pathname]);
      }

      if (method === "POST" && pathname === mottatteOpplysningerPath) {
        mottatteOpplysninger.data = (request.postDataJSON() as MottatteOpplysningerRequest).data;
        return svarJson(route, mottatteOpplysninger);
      }

      if (method === "POST" && pathname in postResponser) {
        return svarJson(route, postResponser[pathname]);
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await page.route(
    (url) => /^\/graphql\/?$/.test(url.pathname),
    async (route) => {
      const { operationName } = route.request().postDataJSON() as { operationName: string };
      if (operationName in graphql) {
        return svarJson(route, graphql[operationName as keyof typeof graphql]);
      }
      ikkeMockedeKall.push(`graphql ${operationName}`);
      return route.fulfill({ status: 404, body: `Ingen mock for graphql ${operationName}` });
    },
  );

  return {
    url: `/melosys/FTRL/saksbehandling/${saksnummer}?behandlingID=${behandlingID}`,
    ikkeMockedeKall,
  };
}
