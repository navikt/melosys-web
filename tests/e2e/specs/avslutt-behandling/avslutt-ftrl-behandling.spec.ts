import { test } from "@playwright/test";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { runAxeAnalyze } from "../../utils/axeUtils";
import { hentPrepopulertSakUrl } from "../../utils/testdataUtils";

test.describe("Avslutt 'Utenfor avtaleland'-behandling for testdata", () => {
  test("Opprett og avslutt 'Utenfor avtaleland'-sak, verifiser redirect til hovedside", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const saksnummer = "MEL-1015";
    const behandlingPage = new BehandlingPage(page, saksnummer);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await behandlingPage.goto(url);

    await behandlingPage.avsluttBehandling("Søknaden er innvilget", "Bekreft");

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Opprett og avslutt 'Utenfor avtaleland'-sak for å sikre full avslutning", async ({ page }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const saksnummer = "MEL-1016";
    const behandlingPage = new BehandlingPage(page, saksnummer);

    // Hent URL til prepopulert FTRL-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await behandlingPage.goto(url);

    await behandlingPage.avsluttBehandling("Søknaden er innvilget", "Bekreft");

    await runAxeAnalyze(page, testInfo.title);
  });
});
