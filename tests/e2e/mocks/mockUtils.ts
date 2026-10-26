import { Page, Route } from "@playwright/test";

export async function svarJson(route: Route, body: unknown): Promise<void> {
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
}

/**
 * Svar på GraphQL-kall med responsen for `operationName`. Ukjente operasjoner legges i `ikkeMockedeKall` og får 404.
 */
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
