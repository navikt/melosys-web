import { Page } from "@playwright/test";
import { FtrlInngangMock, mockFtrlInngang } from "./ftrlInngangMock";
import { svarJson } from "./mockUtils";

/**
 * Mocker en FTRL-behandling (se ftrlInngangMock.ts) og eessi-kallene som brukes i sidepanelet «Opprett ny BUC».
 *
 * Mottakerinstitusjoner filtreres på `landkoder` slik backend gjør.
 */

export interface Mottakerinstitusjon {
  id: string;
  navn: string;
  landkode: string;
}

export interface OpprettBucRequest {
  bucType: string;
  mottakerInstitusjoner: string[];
  vedlegg: { journalpostID: string; dokumentID: string }[];
}

export const MOTTAKERINSTITUSJONER: Mottakerinstitusjon[] = [
  { id: "SE:ACC12600", navn: "The Swedish Social Insurance Agency", landkode: "SE" },
  { id: "DK:DK001", navn: "Udbetaling Danmark", landkode: "DK" },
];

const RINA_URL = "http://localhost:8083/rina/buc/123";

export async function mockOpprettNyBuc(page: Page): Promise<FtrlInngangMock> {
  const mock = await mockFtrlInngang(page);

  // Registreres etter FTRL-mocken og har derfor forrang for eessi-kallene
  await page.route(
    (url) => url.pathname.startsWith("/api/eessi/"),
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();

      if (method === "GET" && url.pathname.startsWith("/api/eessi/mottakerinstitusjoner/")) {
        const landkoder = (url.searchParams.get("landkoder") ?? "").split(",").filter(Boolean);
        return svarJson(
          route,
          MOTTAKERINSTITUSJONER.filter(({ landkode }) => landkoder.length === 0 || landkoder.includes(landkode)),
        );
      }

      if (method === "POST" && /^\/api\/eessi\/bucer\/\d+\/opprett$/.test(url.pathname)) {
        return svarJson(route, { rinaUrl: RINA_URL });
      }

      mock.ikkeMockedeKall.push(`${method} ${url.pathname}`);
      return route.fulfill({ status: 404, body: `Ingen mock for ${method} ${url.pathname}` });
    },
  );

  return mock;
}
