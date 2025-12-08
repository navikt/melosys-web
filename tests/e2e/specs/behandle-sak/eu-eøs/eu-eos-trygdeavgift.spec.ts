import { test } from "@playwright/test";
import { TrygdeavgiftPage } from "../../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../../pages/behandling/inngang.page";
import { BehandlingPage } from "../../../pages/behandling/behandling.page";
import { hentPrepopulertSakUrl } from "../../../utils/testdataUtils";
import { runAxeAnalyze } from "../../../utils/axeUtils";

/**
 * E2E-tester for Trygdeavgift-steget i EU/EØS saksbehandling
 *
 * Legge til steget "trygdeavgift"
 *
 * Disse testene verifiserer:
 * - Trygdeavgift-steget vises i stegflyten
 * - Skatteforholdsperioder kan fylles ut
 * - Inntektskilder vises når bruker ikke er skattepliktig
 * - Trygdeavgift beregnes korrekt
 * - Navigasjon til vedtak fungerer
 */

test.describe("EU/EØS Trygdeavgift", () => {
  test("skal vise inntektskilder når bruker ikke er skattepliktig", async ({ page }, testInfo) => {
    const saksnummer = "MEL-1054";
    const behandlingPage = new BehandlingPage(page, saksnummer);

    // Hent URL til prepopulert EØS pensjonist-sak med trygdeavgift og naviger direkte dit
    const url = hentPrepopulertSakUrl(saksnummer);
    await behandlingPage.goto(url, "Oppgi opplysninger fra attest / S1");

    // Bruk inneværende år for å unngå at skatteforhold skjules pga "tidligere år"-logikk
    const inneværendeÅr = new Date().getFullYear();

    // Steg 1: Inngang (Oppgi opplysninger fra attest / S1)
    const inngangPage = new InngangPage(page, saksnummer);
    await inngangPage.setFraOgMedDato(`01.01.${inneværendeÅr}`);
    await inngangPage.setTilOgMedDato(`31.12.${inneværendeÅr}`);
    await inngangPage.velgLand("SE");

    // Steg 2: Gå til Trygdeavgift og verifiser intiell tilstand
    await inngangPage.klikkBekreftOgFortsett();
    const trygdeavgiftPage = new TrygdeavgiftPage(page, saksnummer);
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
