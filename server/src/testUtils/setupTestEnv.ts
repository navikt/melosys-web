// Setter opp alle miljøvariabler `config.ts` krever, slik at `server.ts` kan
// importeres i tester uten å måtte kjøre med en fullstendig .env-fil.
// Må importeres før noe som (transitivt) importerer `config.js`.
process.env.FRONTEND_APP_NAME ??= "test";
process.env.AZURE_APP_TENANT_ID ??= "test-tenant";
process.env.AZURE_CLIENT_ID ??= "test-client";
process.env.AZURE_CLIENT_NAME ??= "test-client-name";
process.env.CLUSTER_NAME ??= "test-cluster";
process.env.FAKTURERINGSKOMPONENTEN_CLUSTER ??= "test-cluster";
process.env.APP_NAME_FAKTURERINGSKOMPONENTEN_API ??= "test-app";
process.env.APP_NAME_TRYGDEAVTALE_API ??= "test-app";
process.env.APP_NAME_API ??= "test-app";
process.env.ENVIRONMENT_NAME ??= "test";
