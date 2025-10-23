import { expect, test } from "@playwright/test";
import { runAxeAnalyze } from "../../../../utils/axeUtils";
import { HovedsidePage, USER_ID_VALID } from "../../../../pages/hovedside.page";
import { OpprettNySakPage } from "../../../../pages/opprett-ny-sak/opprett-ny-sak.page";
import { getSakId } from "../../../../utils/testUtils";
import { opprettAvtalelandSak } from "../../../../utils/testdataUtils";
import { SokPage } from "../../../../pages/sok.page";
import { BehandlingPage } from "../../../../pages/behandling/behandling.page";

/**
 * MELOSYS-7385: Test regresjonstest for Avtaleland-saker
 *
 * Regresjonstest akseptansekriterium:
 * "Gitt at jeg skal opprette en behandling på en eksistrende sakstype EØS/AVTALELAND
 * skal det kun være 1 aktiv behandling i saken, og det er ikke mulig å opprette flere behandlinger hvis det er en åpen behandling i saken.
 * Det forventes da en gul varselmelding om det. Dersom behandlingen ble avsluttet som HENLAGT skal man fortsatt få gul varselmelding om det.
 * Dersom alle behandlingene er avsluttet i saken (ferdigbehandlet med vedtak), skal det være mulig å opprette NY_VURDERING eller HENVENDELSE."
 */
test.describe("MELOSYS-7385: Avtaleland behandlingslogikk (regresjon)", () => {
  let opprettNySakPage: OpprettNySakPage;

  test.beforeEach(async ({ page }) => {
    const mainPage = new HovedsidePage(page);
    opprettNySakPage = new OpprettNySakPage(page);

    await mainPage.goto();

    await mainPage.klikkOpprettNySakKnapp();
  });

  test("Regresjon: Avtaleland-sak med åpen behandling - gul varselmelding", async ({ page }, testInfo) => {
    test.setTimeout(30000);

    const sakId = await opprettAvtalelandSak(page);

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

    expect(
      await opprettNySakPage.harFeilmelding(feilmelding),
      `Gul varselmelding skal vises for Avtaleland-sak ${getSakId(valgtSak)} med åpen behandling`,
    ).toBe(true);

    // Behandlingstype-gruppen skal IKKE være synlig
    expect(await opprettNySakPage.erBehandlingstypeGruppeSynlig(), "Behandlingstype-gruppe skal ikke være synlig").toBe(
      false,
    );

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Regresjon: Avtaleland-sak med 'Søknaden er henlagt' - gul varselmelding", async ({ page }, testInfo) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og henlegger sak

    const sakId = await opprettAvtalelandSak(page);

    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden/klagen er trukket", sakId);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);

    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Gul varselmelding skal vises selv om behandling er henlagt
    // Note: Henlagt behandling kan vises som "Behandlingen er avsluttet" i UI
    // Sjekk først om det er noen feilmelding i det hele tatt
    expect(
      await opprettNySakPage.harFeilmelding(),
      `En gul varselmelding skal vises for henlagt behandling på sak ${getSakId(valgtSak)}`,
    ).toBe(true);

    // Behandlingstype-gruppen skal IKKE være synlig når behandling er henlagt
    expect(
      await opprettNySakPage.erBehandlingstypeGruppeSynlig(),
      "Behandlingstype-gruppe skal ikke være synlig for henlagt behandling",
    ).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });

  test("Regresjon: Avtaleland-sak med alle ferdigbehandlede - Ny vurdering og Henvendelse tilgjengelig", async ({
    page,
  }, testInfo) => {
    test.setTimeout(30000); // Økt timeout siden vi oppretter og avslutter sak

    const sakId = await opprettAvtalelandSak(page);

    const hovedsidePage = new HovedsidePage(page);
    const sokPage = new SokPage(page);
    const behandlingPage = new BehandlingPage(page);

    await hovedsidePage.goto();
    await hovedsidePage.søkOgVentPåResultat(USER_ID_VALID);

    const sak = sokPage.finnSakBySaksnummer(sakId);
    await sokPage.klikkVisBehandling(sak);
    await behandlingPage.verifiserBehandlingsside();
    await behandlingPage.avsluttBehandling("Søknaden er innvilget", sakId);

    await hovedsidePage.goto();
    await hovedsidePage.klikkOpprettNySakKnapp();

    await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
    await opprettNySakPage.velgKnyttTilEksisterendeSak();

    const valgtSak = opprettNySakPage.finnSakBySaksnummer(sakId);
    await valgtSak.click();

    // === REGRESJONSTEST ===
    // Nye behandlingstyper skal være tilgjengelig for ferdigbehandlet Avtaleland-sak
    await opprettNySakPage.verifiserTilgjengeligeBehandlingstyper(valgtSak, ["Ny vurdering", "Klage", "Henvendelse"]);

    expect(
      await opprettNySakPage.harFeilmelding(),
      `Ingen feilmelding skal vises for ferdigbehandlet Avtaleland-sak ${getSakId(valgtSak)}`,
    ).toBe(false);

    await runAxeAnalyze(page, testInfo.title);
  });
});
