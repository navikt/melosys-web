import * as matchers from "@testing-library/jest-dom";
import { expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import toDiffableHtml from "diffable-html";
import { setupServer } from "msw/node";
import { handlers } from "./test/mocks/handlers";
// Oppsettfilen for Yup kjøres ikke uten videre av vi. Derfor er det nødvendig å importere den manuelt her.
import "./setupYup";

// Enable React act() environment for testing
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

expect.extend(matchers);

// Example: Custom snapshot serializer
expect.addSnapshotSerializer({
  test: (val) => typeof val === "string" || (val && typeof val.outerHTML === "string"),
  serialize: (val) => {
    const html = typeof val === "string" ? val : val.outerHTML;
    const cleanedHtml = html.replace(
      /(?<=\s)(list|id|name|for|aria-labelledby|aria-describedby)="[^"]*"/g,
      ' $1="333"',
    );
    return toDiffableHtml(cleanedHtml);
  },
});

// Sett opp MSW server for API mocking
const server = setupServer(...handlers);

// Gjør serveren tilgjengelig globalt for testfiler
global.mswServer = server;

// Start server før tester kjører
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "bypass", // Ignorer requests uten handlers
  });
});

// Reset handlers etter hver test
afterEach(() => {
  server.resetHandlers();
});

// Steng server etter alle tester
afterAll(() => {
  server.close();
});

global.window.env = {
  APP_NAME: "IKKE_VIKTIG",
  API_BASE_URL: "/api/",
  TRYGDEAVTALE_FLYT_BASE_URL: "/trygdeavtale-flyt/",
  FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL: "/faktureringskomponenten/",
  GRAPHQL_URL: "/graphql/",
  LOCAL_CONTEXT: "/melosys",
  LOCAL_API_PORT: "8080",
  REACT_PUBLIC_URL: "IKKE_VIKTIG",
  AZURE_APP_TENANT_ID: "IKKE_VIKTIG",
  AZURE_CLIENT_ID: "IKKE_VIKTIG",
  CLUSTER: "IKKE_VIKTIG",
  FAKTURERINGSKOMPONENTEN_CLUSTER: "IKKE_VIKTIG",
  FAKTURERINGSKOMPONENTEN_APP_NAME: "IKKE_VIKTIG",
  TRYGDEAVTALE_APP_NAME: "IKKE_VIKTIG",
  MELOSYS_API_APP_NAME: "IKKE_VIKTIG",
  LOCAL_AUTH_TOKEN: "IKKE_VIKTIG",
  ENVIRONMENT: "IKKE_VIKTIG",
};

// Mocker frontendlogger
global.frontendlogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mocker localStorage
global.localStorage = {
  removeItem: vi.fn(),
  setItem: vi.fn(),
  getItem: vi.fn(),
};

// Mocker sessionStorage
global.sessionStorage = {
  removeItem: vi.fn(),
  setItem: vi.fn(),
  getItem: vi.fn(),
};
