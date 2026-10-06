/**
 * Konfigurasjon for melosys-web-serveren.
 *
 * Første iterasjon: kun parity med det tidligere oppsettet (statisk hosting,
 * API-proxying og env-config.js). Ingen nye funksjoner (f.eks. Oasis-basert
 * token-håndtering) er lagt til her ennå.
 */

function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

// Brukes for miljøvariabler som alltid settes eksplisitt i alle miljøer
// (nais.yaml, melosys-docker-compose, melosys-e2e-tests). Gir en konkret
// feilmelding ved oppstart hvis en av dem mangler.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Mangler påkrevd miljøvariabel: ${name}`);
  }
  return value;
}

const app = {
  host: process.env.EXPRESS_HOST ?? "0.0.0.0",
  port: Number(process.env.EXPRESS_PORT ?? "3000"),
  // Mappen med det bygde frontend-innholdet
  staticDir: process.env.STATIC_DIR ?? "./public",
};

// URL-er som API-kall skal proxy'es videre til.
const upstreams = {
  melosysApiUrl: optionalEnv("APP_URL_MELOSYS", "http://melosys-api.melosys.docker-internal:8080"),
  trygdeavtaleUrl: optionalEnv("APP_URL_TRYGDEAVTALE", "http://melosys-trygdeavtale.melosys.docker-internal:8088"),
  faktureringskomponentenUrl: optionalEnv(
    "APP_URL_FAKTURERINGSKOMPONENTEN",
    "http://faktureringskomponenten.melosys.docker-internal:8084",
  ),
};

// Verdier som injiseres i /env-config.js for frontend (+ LOCAL_AUTH_TOKEN som
// kun finnes i docker-compose/e2e sin miljøkonfigurasjon, for å bypasse ekte
// innlogging lokalt/i e2e-tester).
const runtimeConfig = {
  APP_NAME: requiredEnv("FRONTEND_APP_NAME"),
  API_BASE_URL: "/api/",
  TRYGDEAVTALE_FLYT_BASE_URL: "/trygdeavtale-flyt/",
  FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL: "/faktureringskomponenten/",
  GRAPHQL_URL: "/graphql/",
  LOCAL_CONTEXT: "/melosys",
  LOCAL_API_PORT: "8080",
  AZURE_APP_TENANT_ID: requiredEnv("AZURE_APP_TENANT_ID"),
  AZURE_CLIENT_ID: requiredEnv("AZURE_CLIENT_ID"),
  AZURE_CLIENT_NAME: requiredEnv("AZURE_CLIENT_NAME"),
  CLUSTER: requiredEnv("CLUSTER_NAME"),
  FAKTURERINGSKOMPONENTEN_CLUSTER: requiredEnv("FAKTURERINGSKOMPONENTEN_CLUSTER"),
  FAKTURERINGSKOMPONENTEN_APP_NAME: requiredEnv("APP_NAME_FAKTURERINGSKOMPONENTEN_API"),
  TRYGDEAVTALE_APP_NAME: requiredEnv("APP_NAME_TRYGDEAVTALE_API"),
  MELOSYS_API_APP_NAME: requiredEnv("APP_NAME_API"),
  ENVIRONMENT: requiredEnv("ENVIRONMENT_NAME"),
  // Kun satt lokalt/i e2e (ikke i prod/dev-vars) -> utelates fra
  // env-config.js (JSON.stringify dropper undefined-verdier) hvis ikke satt.
  LOCAL_AUTH_TOKEN: process.env.LOCAL_AUTH_TOKEN,
};

export default {
  app,
  upstreams,
  runtimeConfig,
};
