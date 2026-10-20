import { Page } from "@playwright/test";
import fixture from "./eu-eos-registrering-unntak.json" with { type: "json" };
import { mockGraphql, svarJson } from "./eosBehandlingMock";

/**
 * Mocker alle API- og GraphQL-kall for en EU/EØS-behandling «Melding om utstasjonering – A009»
 * der den automatiske kontrollen har gitt treff (periode over 24 måneder), slik at
 * unntaksperioden må vurderes manuelt.
 */

export interface IkkeGodkjennRequest {
  ikkeGodkjentBegrunnelseKoder: string[];
  begrunnelseFritekst: string;
}

export interface EosRegistreringUnntakMock {
  url: string;
  /** Kall som ikke har en mock (method + path). Bør være tom etter testen. */
  ikkeMockedeKall: string[];
}

export async function mockEosRegistreringUnntak(page: Page): Promise<EosRegistreringUnntakMock> {
  const { saksnummer, behandlingID, get, graphql, kontrollfeil } = fixture;
  const getResponser: Record<string, unknown> = get;
  const ikkeMockedeKall: string[] = [];
  // Etter innsending navigeres det til forsiden, som ikke er mocket
  let erInnsendt = false;

  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      const method = request.method();

      if (method === "GET" && pathname in getResponser) {
        return svarJson(route, getResponser[pathname]);
      }

      if (method === "POST" && pathname === `/api/kontroll/${behandlingID}/unntaksperiode`) {
        return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify(kontrollfeil) });
      }

      if (method === "POST" && pathname === `/api/saksflyt/unntaksperioder/${behandlingID}/ikkegodkjenn`) {
        erInnsendt = true;
        return svarJson(route, {});
      }

      if (!erInnsendt) {
        ikkeMockedeKall.push(`${method} ${pathname}`);
      }
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${pathname}` });
    },
  );

  await mockGraphql(page, graphql, ikkeMockedeKall);

  return {
    url: `/melosys/EU_EOS/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`,
    ikkeMockedeKall,
  };
}
