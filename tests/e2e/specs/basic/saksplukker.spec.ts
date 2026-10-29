import { expect } from "@playwright/test";
import { test } from "../../recording/fixtures";
import { HovedsidePage } from "../../pages/hovedside.page";
import { SaksplukkerPage } from "../../pages/saksplukker.page";
import { mockSaksplukker, SaksplukkerMock } from "../../mocks/saksplukkerMock";

let mock: SaksplukkerMock;
let hovedside: HovedsidePage;
let saksplukker: SaksplukkerPage;

test.describe("Saksplukker («Behandle sak») på forsiden", () => {
  test.beforeEach(async ({ page }) => {
    mock = await mockSaksplukker(page);
    hovedside = new HovedsidePage(page);
    saksplukker = new SaksplukkerPage(page);

    await hovedside.goto();
  });

  test("viser feilmelding på alle felt når ingenting er valgt", async () => {
    await saksplukker.klikkBehandleSak();

    await saksplukker.verifiserAntallFeilmeldinger(3);
    expect(mock.plukk()).toBeNull();
    expect(mock.ikkeMockedeKall).toEqual([]);
  });

  test("nullstiller sakstema og behandlingstema når sakstype endres", async () => {
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");

    await saksplukker.velgSakstype("Avtaleland");

    await saksplukker.verifiserValgteVerdier({ sakstype: "TRYGDEAVTALE", sakstema: "", behandlingstema: "" });
    expect(mock.ikkeMockedeKall).toEqual([]);
  });

  test("nullstiller behandlingstema når sakstema endres", async () => {
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");

    await saksplukker.velgSakstema("Unntak");

    await saksplukker.verifiserValgteVerdier({ sakstype: "EU_EOS", sakstema: "UNNTAK", behandlingstema: "" });
    expect(mock.ikkeMockedeKall).toEqual([]);
  });

  test("viser melding når ingen saker finnes, og «Nullstill» tømmer skjemaet og skjuler meldingen", async () => {
    mock.settPlukkSvar({ antallUtildelteOppgaver: 42 });
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");

    await saksplukker.klikkBehandleSak();

    await saksplukker.verifiserIngenSakerFunnet(42);
    expect(mock.plukk()).toEqual({
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
    });

    await saksplukker.klikkNullstill();

    await saksplukker.verifiserIngenSakerFunnetSkjult();
    await saksplukker.verifiserValgteVerdier({ sakstype: "", sakstema: "", behandlingstema: "" });
    await saksplukker.verifiserAntallFeilmeldinger(0);
    expect(mock.ikkeMockedeKall).toEqual([]);
  });

  test("sender til behandlingen når en sak blir plukket", async () => {
    mock.settPlukkSvar({
      saksnummer: "MEL-1",
      behandlingID: 1,
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
      behandlingstype: "FØRSTEGANG",
    });
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");
    const ikkeMockedeKallFørPlukk = [...mock.ikkeMockedeKall];

    await saksplukker.klikkBehandleSak();

    await hovedside.verifiserUrl(/\/melosys\/EU_EOS\/saksbehandling\/MEL-1\/?\?behandlingID=1/);
    expect(ikkeMockedeKallFørPlukk).toEqual([]);
  });

  test("beholder valgene når man går bort fra og tilbake til forsiden", async () => {
    mock.settPlukkSvar({ antallUtildelteOppgaver: 1 });
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");

    await hovedside.klikkOpprettNySakKnapp();
    await hovedside.gåTilbake();

    await saksplukker.verifiserValgteVerdier({
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
    });

    await saksplukker.klikkBehandleSak();

    await saksplukker.verifiserIngenSakerFunnet(1);
    expect(mock.plukk()).toEqual({
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
    });
    expect(mock.ikkeMockedeKall).toEqual([]);
  });

  test("legger valgene i URL-en og beholder dem ved refresh", async () => {
    mock.settPlukkSvar({ antallUtildelteOppgaver: 1 });
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");

    await hovedside.verifiserUrl(/\?sakstype=EU_EOS&sakstema=MEDLEMSKAP_LOVVALG&behandlingstema=UTSENDT_ARBEIDSTAKER$/);

    await hovedside.lastInnPåNytt();

    await saksplukker.verifiserValgteVerdier({
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
    });
    await saksplukker.klikkBehandleSak();
    await saksplukker.verifiserIngenSakerFunnet(1);
    expect(mock.plukk()).toEqual({
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP_LOVVALG",
      behandlingstema: "UTSENDT_ARBEIDSTAKER",
    });
    expect(mock.ikkeMockedeKall).toEqual([]);
  });

  test("«Nullstill» fjerner valgene fra URL-en", async () => {
    await saksplukker.velg("EU/EØS-land", "Medlemskap og lovvalg", "Utsendt arbeidstaker");

    await saksplukker.klikkNullstill();

    await hovedside.verifiserUrl(/\/melosys$/);
  });

  test("ignorerer ugyldige verdier i URL-en", async () => {
    await hovedside.goto("sakstype=EU_EOS&sakstema=FINNES_IKKE&behandlingstema=UTSENDT_ARBEIDSTAKER");

    await saksplukker.verifiserValgteVerdier({ sakstype: "EU_EOS", sakstema: "", behandlingstema: "" });

    await saksplukker.klikkBehandleSak();

    await saksplukker.verifiserAntallFeilmeldinger(2);
    expect(mock.plukk()).toBeNull();
  });
});
