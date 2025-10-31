import { expect, test } from "@playwright/test";
import { SokPage } from "../../pages/sok.page";
import { BehandlingPage } from "../../pages/behandling/behandling.page";
import { StegvelgerPage } from "../../pages/behandling/stegvelger.page";
import { TrygdeavgiftPage } from "../../pages/behandling/trygdeavgift.page";
import { InngangPage } from "../../pages/behandling/inngang.page";
import { YrkesgruppePage } from "../../pages/behandling/yrkesgruppe.page";
import { VirksomhetPage } from "../../pages/behandling/virksomhet.page";
import { opprettEøsPensjonistSakMedTrygdeavgift } from "../../utils/testdataUtils";
import { runAxeAnalyze } from "../../utils/axeUtils";

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
  test("skal vise trygdeavgift-steget i flyten", async ({ page }, testInfo) => {
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);

    const sak = await opprettEøsPensjonistSakMedTrygdeavgift(page);
    const saksnummer = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom Inngang -> Yrkesgruppe -> Virksomhet
    const inngangPage = new InngangPage(page);
    const yrkesgruppePage = new YrkesgruppePage(page);
    const virksomhetPage = new VirksomhetPage(page);

    // Steg 1: Inngang
    await inngangPage.ventPaInngangSteg();
    await inngangPage.klikkNeste();

    // Steg 2: Yrkesgruppe
    await yrkesgruppePage.ventPaYrkesgruppesteg();
    await yrkesgruppePage.velgYrkesaktiv();
    await yrkesgruppePage.klikkNeste();

    // Steg 3: Virksomhet
    await virksomhetPage.ventPaVirksomhetSteg();
    await virksomhetPage.velgForsteVirksomhet();
    await virksomhetPage.klikkNeste();

    // Nå skal vi være på Trygdeavgift-steget
    await virksomhetPage.klikkNeste();

    // Verifiser at stegvelger vises
    await stegvelgerPage.ventPaStegvelger();

    // Hent alle steg og verifiser at "Trygdeavgift" finnes
    const alleSteg = await stegvelgerPage.hentAlleSteg();
    console.log("Steg funnet:", alleSteg);

    const harTrygdeavgiftSteg = alleSteg.some(
      (steg) => steg.toLowerCase().includes("trygdeavgift") || steg.toLowerCase().includes("avgift"),
    );

    expect(harTrygdeavgiftSteg, `[${saksnummer}] Trygdeavgift-steget skal være synlig i stegflyten`).toBe(true);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne fylle ut skatteforholdsperioder når bruker er skattepliktig", async ({ page }, testInfo) => {
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const trygdeavgiftPage = new TrygdeavgiftPage(page);

    const sak = await opprettEøsPensjonistSakMedTrygdeavgift(page);
    const saksnummer = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom Inngang -> Yrkesgruppe -> Virksomhet
    const inngangPage = new InngangPage(page);
    const yrkesgruppePage = new YrkesgruppePage(page);
    const virksomhetPage = new VirksomhetPage(page);

    // Steg 1: Inngang
    await inngangPage.ventPaInngangSteg();
    await inngangPage.klikkNeste();

    // Steg 2: Yrkesgruppe
    await yrkesgruppePage.ventPaYrkesgruppesteg();
    await yrkesgruppePage.velgYrkesaktiv();
    await yrkesgruppePage.klikkNeste();

    // Steg 3: Virksomhet
    await virksomhetPage.ventPaVirksomhetSteg();
    await virksomhetPage.velgForsteVirksomhet();
    await virksomhetPage.klikkNeste();

    // Nå skal vi være på Trygdeavgift-steget
    await virksomhetPage.klikkNeste();

    // Verifiser at vi er på trygdeavgift-steget
    await trygdeavgiftPage.ventPaTrygdeavgiftSteg();

    // Verifiser at skatteforholdsperioder er synlige
    const skatteperioderSynlige = await trygdeavgiftPage.verifiserSkatteforholdsperioderSynlige();
    expect(skatteperioderSynlige, `[${saksnummer}] Skatteforholdsperioder skal være synlige`).toBe(true);

    // Velg at personen ER skattepliktig
    await trygdeavgiftPage.velgSkattepliktig(0, true);

    // Verifiser at inntektskilder IKKE vises når bruker er skattepliktig i hele perioden
    const inntektskilderSynlige = await trygdeavgiftPage.verifiserInntektskilderSynlige();
    expect(inntektskilderSynlige, `[${saksnummer}] Inntektskilder skal IKKE vises når bruker er skattepliktig`).toBe(
      false,
    );

    // Verifiser at beregning vises
    await trygdeavgiftPage.verifiserBeregningVises();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal vise inntektskilder når bruker ikke er skattepliktig", async ({ page }, testInfo) => {
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const trygdeavgiftPage = new TrygdeavgiftPage(page);

    const sak = await opprettEøsPensjonistSakMedTrygdeavgift(page);
    const saksnummer = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom Inngang -> Yrkesgruppe -> Virksomhet
    const inngangPage = new InngangPage(page);
    const yrkesgruppePage = new YrkesgruppePage(page);
    const virksomhetPage = new VirksomhetPage(page);

    // Steg 1: Inngang
    await inngangPage.ventPaInngangSteg();
    await inngangPage.klikkNeste();

    // Steg 2: Yrkesgruppe
    await yrkesgruppePage.ventPaYrkesgruppesteg();
    await yrkesgruppePage.velgYrkesaktiv();
    await yrkesgruppePage.klikkNeste();

    // Steg 3: Virksomhet
    await virksomhetPage.ventPaVirksomhetSteg();
    await virksomhetPage.velgForsteVirksomhet();
    await virksomhetPage.klikkNeste();

    // Nå skal vi være på Trygdeavgift-steget
    await virksomhetPage.klikkNeste();

    // Verifiser at vi er på trygdeavgift-steget
    await trygdeavgiftPage.ventPaTrygdeavgiftSteg();

    // Velg at personen IKKE er skattepliktig
    await trygdeavgiftPage.velgSkattepliktig(0, false);

    // Verifiser at inntektskilder nå vises
    const inntektskilderSynlige = await trygdeavgiftPage.verifiserInntektskilderSynlige();
    expect(inntektskilderSynlige, `[${saksnummer}] Inntektskilder skal vises når bruker IKKE er skattepliktig`).toBe(
      true,
    );

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne fylle ut inntektskilder og beregne trygdeavgift", async ({ page }, testInfo) => {
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const trygdeavgiftPage = new TrygdeavgiftPage(page);

    const sak = await opprettEøsPensjonistSakMedTrygdeavgift(page);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom Inngang -> Yrkesgruppe -> Virksomhet
    const inngangPage = new InngangPage(page);
    const yrkesgruppePage = new YrkesgruppePage(page);
    const virksomhetPage = new VirksomhetPage(page);

    // Steg 1: Inngang
    await inngangPage.ventPaInngangSteg();
    await inngangPage.klikkNeste();

    // Steg 2: Yrkesgruppe
    await yrkesgruppePage.ventPaYrkesgruppesteg();
    await yrkesgruppePage.velgYrkesaktiv();
    await yrkesgruppePage.klikkNeste();

    // Steg 3: Virksomhet
    await virksomhetPage.ventPaVirksomhetSteg();
    await virksomhetPage.velgForsteVirksomhet();
    await virksomhetPage.klikkNeste();

    // Nå skal vi være på Trygdeavgift-steget
    await virksomhetPage.klikkNeste();

    // Verifiser at vi er på trygdeavgift-steget
    await trygdeavgiftPage.ventPaTrygdeavgiftSteg();

    // Velg at personen IKKE er skattepliktig
    await trygdeavgiftPage.velgSkattepliktig(0, false);

    // Fyll ut inntektskilde
    await trygdeavgiftPage.velgInntektskildetype(0, "Arbeidsinntekt");
    await trygdeavgiftPage.fyllInnInntekt(0, "500000");

    // Verifiser at beregning vises
    await trygdeavgiftPage.verifiserBeregningVises();

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal disable Neste-knapp når skjema er ugyldig", async ({ page }, testInfo) => {
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const trygdeavgiftPage = new TrygdeavgiftPage(page);

    const sak = await opprettEøsPensjonistSakMedTrygdeavgift(page);
    const saksnummer = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom Inngang -> Yrkesgruppe -> Virksomhet
    const inngangPage = new InngangPage(page);
    const yrkesgruppePage = new YrkesgruppePage(page);
    const virksomhetPage = new VirksomhetPage(page);

    // Steg 1: Inngang
    await inngangPage.ventPaInngangSteg();
    await inngangPage.klikkNeste();

    // Steg 2: Yrkesgruppe
    await yrkesgruppePage.ventPaYrkesgruppesteg();
    await yrkesgruppePage.velgYrkesaktiv();
    await yrkesgruppePage.klikkNeste();

    // Steg 3: Virksomhet
    await virksomhetPage.ventPaVirksomhetSteg();
    await virksomhetPage.velgForsteVirksomhet();
    await virksomhetPage.klikkNeste();

    // Nå skal vi være på Trygdeavgift-steget
    await virksomhetPage.klikkNeste();

    // Verifiser at vi er på trygdeavgift-steget
    await trygdeavgiftPage.ventPaTrygdeavgiftSteg();

    // Verifiser at Neste-knapp er disabled (skjemaet skal være ugyldig når ingenting er fylt ut)
    const nesteDisabled = await trygdeavgiftPage.erNesteKnappDisabled();
    expect(nesteDisabled, `[${saksnummer}] Neste-knapp skal være disabled når skjema er ugyldig`).toBe(true);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("skal kunne navigere til vedtak etter å ha fylt ut trygdeavgift", async ({ page }, testInfo) => {
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);
    const stegvelgerPage = new StegvelgerPage(page);
    const trygdeavgiftPage = new TrygdeavgiftPage(page);

    const sak = await opprettEøsPensjonistSakMedTrygdeavgift(page);
    const saksnummer = await sokPage.getSaksnummer(sak);

    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();

    // Naviger gjennom Inngang -> Yrkesgruppe -> Virksomhet
    const inngangPage = new InngangPage(page);
    const yrkesgruppePage = new YrkesgruppePage(page);
    const virksomhetPage = new VirksomhetPage(page);

    // Steg 1: Inngang
    await inngangPage.ventPaInngangSteg();
    await inngangPage.klikkNeste();

    // Steg 2: Yrkesgruppe
    await yrkesgruppePage.ventPaYrkesgruppesteg();
    await yrkesgruppePage.velgYrkesaktiv();
    await yrkesgruppePage.klikkNeste();

    // Steg 3: Virksomhet
    await virksomhetPage.ventPaVirksomhetSteg();
    await virksomhetPage.velgForsteVirksomhet();
    await virksomhetPage.klikkNeste();

    // Nå skal vi være på Trygdeavgift-steget
    await virksomhetPage.klikkNeste();

    // Verifiser at vi er på trygdeavgift-steget
    await trygdeavgiftPage.ventPaTrygdeavgiftSteg();

    // Fyll ut minimum for å kunne gå videre
    await trygdeavgiftPage.velgSkattepliktig(0, true);

    // Verifiser at beregning vises
    await trygdeavgiftPage.verifiserBeregningVises();

    // Klikk Neste for å gå til vedtak
    await trygdeavgiftPage.klikkNeste();

    // Verifiser at vi har gått til neste steg (Vedtak)
    const aktivtSteg = await stegvelgerPage.hentAktivtSteg();
    console.log("Aktivt steg etter Neste:", aktivtSteg);

    const erPaVedtak = aktivtSteg.toLowerCase().includes("vedtak");
    expect(erPaVedtak, `[${saksnummer}] Skal være på Vedtak-steget etter trygdeavgift`).toBe(true);

    await runAxeAnalyze(page, testInfo.title);
  });
});
