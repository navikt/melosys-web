import { expect, test } from "../../../recording/fixtures";
import { HovedsidePage, USER_ID_VALID } from "../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { TIMEOUT_FOR_COMPLEX_TESTS } from "../../../utils/testUtils";

/**
 * Test regresjonstest for Avtaleland-saker
 *
 * Regresjonstest akseptansekriterium:
 * "Gitt at jeg skal opprette en behandling på en eksistrende sakstype EØS/AVTALELAND
 * skal det kun være 1 aktiv behandling i saken, og det er ikke mulig å opprette flere behandlinger hvis det er en åpen behandling i saken.
 * Det forventes da en gul varselmelding om det. Dersom behandlingen ble avsluttet som HENLAGT skal man fortsatt få gul varselmelding om det.
 * Dersom alle behandlingene er avsluttet i saken (ferdigbehandlet med vedtak), skal det være mulig å opprette NY_VURDERING eller HENVENDELSE."
 */
test.describe("Avtaleland behandlingslogikk (regresjon)", () => {
  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page, apiRecorder }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();

    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Regresjon: Avtaleland med åpen behandling - viser varselmelding", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    // Bruk prepopulert Avtaleland-sak med UNDER_BEHANDLING status
    const sakId = "MEL-1069";

    const hovedsidePage = new HovedsidePage(page);
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Gul varselmelding skal vises for Avtaleland-sak med åpen behandling
    const feilmelding = "Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling";

    // Vent spesifikt på at feilmeldingen vises (ikke bare loading-panelet)
    await page
      .locator(".knyttTilSak__behandlingspanel")
      .filter({ hasText: feilmelding })
      .waitFor({ state: "visible", timeout: 10000 });

    expect(
      await opprettNySakPage.harFeilmelding(feilmelding),
      `Gul varselmelding skal vises for Avtaleland-sak ${sakId} med åpen behandling`,
    ).toBe(true);

    // Behandlingstype-gruppen skal IKKE være synlig
    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();
  });

  test("Regresjon: Avtaleland med henlagt søknad - viser varselmelding", async ({ page, apiRecorder }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    const hovedsidePage = new HovedsidePage(page);
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const sakId = "MEL-1063";
    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Gul varselmelding skal vises selv om behandling er henlagt
    // Note: Henlagt behandling kan vises som "Behandlingen er avsluttet" i UI
    // Vent på at feilmeldingspanelet vises (ikke bare loading-panelet)
    await page.locator(".knyttTilSak__behandlingspanel").waitFor({ state: "visible", timeout: 10000 });

    // Sjekk først om det er noen feilmelding i det hele tatt
    expect(
      await opprettNySakPage.harFeilmelding(),
      `En gul varselmelding skal vises for henlagt behandling på sak ${sakId}`,
    ).toBe(true);

    // Behandlingstype-gruppen skal IKKE være synlig når behandling er henlagt
    await opprettNySakPage.verifiserBehandlingstypeGruppeIkkeSynlig();
  });

  test("Regresjon: Avtaleland med ferdigbehandlede - Ny vurdering og Henvendelse tilgjengelig", async ({
    page,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_FOR_COMPLEX_TESTS);

    // Bruk prepopulert AVSLUTTET Avtaleland-sak (MEL-1067)
    const sakId = "MEL-1067";

    const hovedsidePage = new HovedsidePage(page);
    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Nye behandlingstyper skal være tilgjengelig for ferdigbehandlet Avtaleland-sak
    // Vent på at panelrammen med behandlingstyper vises (ikke bare loading-panelet)
    await page.locator(".knyttTilSak__panelramme").waitFor({ state: "visible" });

    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(
      valgtSak,
      ["Ny vurdering", "Klage", "Henvendelse"],
      sakId,
    );

    expect(
      await opprettNySakPage.harFeilmelding(),
      `Ingen feilmelding skal vises for ferdigbehandlet Avtaleland-sak ${sakId}`,
    ).toBe(false);
  });
});
