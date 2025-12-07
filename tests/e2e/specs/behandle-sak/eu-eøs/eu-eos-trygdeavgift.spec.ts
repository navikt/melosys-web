import { test } from "../../../recording/fixtures";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";
import { getTestMode } from "../../../config/mode";

/**
 * E2E-tester for Trygdeavgift-steget i EU/EØS saksbehandling
 *
 * MELOSYS-7661: Legge til steget "trygdeavgift"
 *
 * Disse testene verifiserer:
 * - Trygdeavgift-steget vises i stegflyten
 * - Skatteforholdsperioder kan fylles ut
 * - Inntektskilder vises når bruker ikke er skattepliktig
 * - Trygdeavgift beregnes korrekt
 * - Navigasjon til vedtak fungerer
 */

test.describe("EU/EØS Trygdeavgift", () => {
  test("skal vise inntektskilder når bruker ikke er skattepliktig", async ({ page, apiRecorder }, testInfo) => {
    // Skip in playback mode: This test requires mutable state (form saves + subsequent reads)
    // The mock server can't simulate write-then-read patterns where POST updates state
    // and subsequent GETs should return the updated data
    test.skip(getTestMode() === "playback", "Requires mutable state - incompatible with playback mode");

    const behandlingPage = new BehandlingPage(page);

    // Hent URL til prepopulert EØS pensjonist-sak med trygdeavgift og naviger direkte dit
    const url = hentPrepopulertSakUrl("MEL-1054");
    await behandlingPage.goto(url, "Oppgi opplysninger fra attest / S1");

    // Steg 1: Inngang (Oppgi opplysninger fra attest / S1)
    // Bruk inneværende år for å unngå "tidligere år"-meldingen som skjuler skatteforholdsperioder
    const currentYear = new Date().getFullYear();
    const inngangPage = new InngangPage(page);
    await inngangPage.setFraOgMedDato(`01.01.${currentYear}`);
    await inngangPage.setTilOgMedDato(`31.12.${currentYear}`);
    await inngangPage.velgLand("SE");

    // Steg 2: Gå til Trygdeavgift og verifiser initiell tilstand
    await inngangPage.klikkBekreftOgFortsett();
    const trygdeavgiftPage = new TrygdeavgiftPage(page);
    await trygdeavgiftPage.verifiserSteg("Trygdeavgift");
    await trygdeavgiftPage.verifiserSkattepliktigErIkkeValgt();
    await trygdeavgiftPage.verifiserInntektskilderSynlige(false);

    // Velg at personen IKKE er skattepliktig og verifiser at inntektskilder nå vises
    await trygdeavgiftPage.velgSkattepliktig(0, false);
    await trygdeavgiftPage.verifiserInntektskilderSynlige(true);

    // Velg at personen ER skattepliktig og verifiser at inntektskilder nå IKKE vises
    await trygdeavgiftPage.velgSkattepliktig(0, true);
    await trygdeavgiftPage.verifiserInntektskilderSynlige(false);

    // Steg 3: Gå til Bekreftelse og verifiser intiell tilstand
    await inngangPage.klikkBekreftOgFortsett();
    await trygdeavgiftPage.verifiserSteg("Bekreftelse");

    await runAxeAnalyze(page, testInfo.title);
  });
});
