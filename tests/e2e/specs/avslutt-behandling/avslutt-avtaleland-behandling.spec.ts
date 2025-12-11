import { test } from "../../recording/fixtures";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../utils/testUtils";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { hentPrepopulertSakUrl } from "../../utils/testdataUtils";
import { UI_TEXTS } from "../../config/ui-texts";

test.describe("Avslutt Avtaleland-behandling for testdata", () => {
  test("Opprett og avslutt Avtaleland-sak, verifiser redirect til hovedside", async ({
    page,
    apiRecorder,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS); // Økt timeout siden vi oppretter og avslutter sak
    const saksnummer = "MEL-1001";
    const behandlingPage = new BehandlingPage(page, saksnummer);

    // Hent URL til prepopulert Avtaleland-sak og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await behandlingPage.goto(url);

    await behandlingPage.avsluttBehandling(UI_TEXTS.VEDTAK.INNVILGET, UI_TEXTS.BUTTONS.BEKREFT);
  });
});
