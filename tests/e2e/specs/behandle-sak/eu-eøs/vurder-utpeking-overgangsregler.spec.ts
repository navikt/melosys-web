import { test, expect } from "../../../recording/fixtures";
import { EosVurderUtpekingPage } from "../../../pages/behandling/eos-vurder-utpeking.page";
import { EosVurderUtpekingMock, mockEosVurderUtpeking } from "../../../mocks/eosVurderUtpekingMock";

/**
 * E2E-tester for «Overgangsregler gjelder» ved vurdering av utpeking (EU/EØS, mottatt A003).
 *
 * Overgangsreglene var tidligere en egenutviklet listevelger og er byttet ut med checkboxer.
 * Testene verifiserer valideringen ved art. 87(8) (nøyaktig én regel) og at de avkryssede
 * reglene sendes i POST /api/mottatteopplysninger/{id}.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/eosVurderUtpekingMock.ts).
 */

const GODKJENN = "Godkjenn";

const OVERGANGSREGEL = {
  ART14A_2: { label: "Rfo. 1408/1971 artikkel 14a nr. 2", kode: "FO_1408_1971_ART14A_2" },
  ART14C_A: { label: "Rfo. 1408/1971 artikkel 14c bokstav a", kode: "FO_1408_1971_ART14C_A" },
  ART14C_B: { label: "Rfo. 1408/1971 artikkel 14c bokstav b", kode: "FO_1408_1971_ART14C_B" },
};

const FEILMELDING = {
  MINST_1: "Du må velge en overgangsregel",
  MAKS_1: "Du kan kun velge en overgangsregel",
};

test.describe("EU/EØS Vurdering av utpeking - overgangsregler", () => {
  let mock: EosVurderUtpekingMock;
  let vurdering: EosVurderUtpekingPage;

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test.describe("uten lagrede overgangsregler", () => {
    test.beforeEach(async ({ page }) => {
      mock = await mockEosVurderUtpeking(page);
      vurdering = new EosVurderUtpekingPage(page);
      await vurdering.goto(mock.url);
      await vurdering.velgVurdering(GODKJENN);
    });

    test("krever nøyaktig én overgangsregel ved art. 87(8)", async () => {
      await vurdering.verifiserAvkryssedeOvergangsregler([]);
      await vurdering.verifiserFeilmelding(FEILMELDING.MINST_1);
      await vurdering.verifiserKanIkkeFortsette();

      await vurdering.kryssAvOvergangsregler([OVERGANGSREGEL.ART14A_2.label, OVERGANGSREGEL.ART14C_A.label]);
      await vurdering.verifiserFeilmelding(FEILMELDING.MAKS_1);
      await vurdering.verifiserKanIkkeFortsette();

      await vurdering.fjernOvergangsregler([OVERGANGSREGEL.ART14A_2.label]);
      await vurdering.verifiserIngenFeilmelding([FEILMELDING.MINST_1, FEILMELDING.MAKS_1]);
      await vurdering.verifiserKanFortsette();
    });

    test("sender avkrysset overgangsregel i mottatteopplysninger", async () => {
      await vurdering.kryssAvOvergangsregler([OVERGANGSREGEL.ART14C_B.label]);

      const payload = await vurdering.bekreftOgHentMottatteOpplysninger();

      expect(payload.data.overgangsregelbestemmelser).toEqual([OVERGANGSREGEL.ART14C_B.kode]);
    });
  });

  test("viser lagret overgangsregel og sender ny ved endring", async ({ page }) => {
    mock = await mockEosVurderUtpeking(page, {
      overgangsregelbestemmelser: [{ kode: OVERGANGSREGEL.ART14A_2.kode, term: OVERGANGSREGEL.ART14A_2.label }],
    });
    vurdering = new EosVurderUtpekingPage(page);
    await vurdering.goto(mock.url);
    await vurdering.velgVurdering(GODKJENN);

    await vurdering.verifiserAvkryssedeOvergangsregler([OVERGANGSREGEL.ART14A_2.label]);

    await vurdering.fjernOvergangsregler([OVERGANGSREGEL.ART14A_2.label]);
    await vurdering.kryssAvOvergangsregler([OVERGANGSREGEL.ART14C_A.label]);
    const payload = await vurdering.bekreftOgHentMottatteOpplysninger();

    expect(payload.data.overgangsregelbestemmelser).toEqual([OVERGANGSREGEL.ART14C_A.kode]);
  });
});
