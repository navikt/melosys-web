import { Page, Route } from "@playwright/test";
import fixture from "./eu-eos-utsendt-arbeidstaker.json" with { type: "json" };

/**
 * Mocker alle API- og GraphQL-kall for en EU/EØS-behandling (Utsendt arbeidstaker)
 * der alle steg frem til «Vurdering arbeidstaker» er fullført.
 *
 * Gjør testene uavhengige av melosys-api og opptak. Fungerer derfor likt i live-,
 * record- og playback-modus.
 *
 * Vilkår holdes i en enkel state slik at det som POST-es til /api/vilkaar
 * returneres ved påfølgende kall.
 */

export interface Vilkaar {
  vilkaar: string;
  oppfylt: boolean;
  begrunnelseKoder: string[];
  begrunnelseFritekst: string | null;
  begrunnelseFritekstEngelsk: string | null;
}

export interface EosBehandlingMock {
  saksnummer: string;
  behandlingID: number;
  url: string;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

const INNGANGSVILKAAR = "FO_883_2004_INNGANGSVILKAAR";

// Backend returnerer et beriket objekt for disse, så vi svarer med lagret GET-respons i stedet for å speile request-body
const POST_SOM_RETURNERER_LAGRET = ["/api/avklartefakta/", "/api/mottatteopplysninger/"];

export async function svarJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
}

export async function mockEosUtsendtArbeidstaker(page: Page): Promise<EosBehandlingMock> {
  const { saksnummer, behandlingID, graphql } = fixture;
  const getResponser: Record<string, unknown> = structuredClone(fixture.get);
  const vilkaarPath = `/api/vilkaar/${behandlingID}`;
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

      if (method === "GET" && pathname.startsWith("/api/eessi/mottakerinstitusjoner/")) {
        return svarJson(route, []);
      }

      if (method === "POST" && pathname === vilkaarPath) {
        const lagret = (getResponser[vilkaarPath] as Vilkaar[]).filter((v) => v.vilkaar === INNGANGSVILKAAR);
        getResponser[vilkaarPath] = [...lagret, ...(request.postDataJSON() as Vilkaar[])];
        return svarJson(route, getResponser[vilkaarPath]);
      }

      if (method === "POST" && pathname in getResponser) {
        if (!POST_SOM_RETURNERER_LAGRET.some((prefix) => pathname.startsWith(prefix))) {
          getResponser[pathname] = request.postDataJSON();
        }
        return svarJson(route, getResponser[pathname]);
      }

      ikkeMockedeKall.push(`${method} ${pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await mockGraphql(page, graphql, ikkeMockedeKall);

  return {
    saksnummer,
    behandlingID,
    url: `/melosys/EU_EOS/saksbehandling/${saksnummer}?behandlingID=${behandlingID}`,
    ikkeMockedeKall,
  };
}

export async function mockGraphql(
  page: Page,
  graphql: Record<string, unknown>,
  ikkeMockedeKall: string[],
): Promise<void> {
  await page.route(
    (url) => /^\/graphql\/?$/.test(url.pathname),
    async (route) => {
      const { operationName } = route.request().postDataJSON() as { operationName: string };
      if (operationName in graphql) {
        return svarJson(route, graphql[operationName]);
      }
      ikkeMockedeKall.push(`graphql ${operationName}`);
      return route.fulfill({ status: 404, body: `Ingen mock for graphql ${operationName}` });
    },
  );
}
