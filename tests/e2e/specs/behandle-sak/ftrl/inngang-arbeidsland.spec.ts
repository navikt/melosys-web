import { test, expect } from "../../../recording/fixtures";
import { FtrlInngangPage } from "../../../pages/behandling/ftrl-inngang.page";
import { FtrlInngangMock, mockFtrlInngang } from "../../../mocks/ftrlInngangMock";

/**
 * E2E-tester for arbeidsland på Inngang-steget i FTRL (Utenfor avtaleland).
 *
 * Arbeidsland var tidligere en react-select multiselect og er byttet til Aksel Combobox.
 * Testene verifiserer forhåndsutfylling, validering, advarsel for avtaleland og at valgte land
 * sendes i POST /api/mottatteopplysninger/{id} og POST /api/avklartefakta/{id}/arbeidsland.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/ftrlInngangMock.ts).
 */

const LAND = {
  KINA: { navn: "Kina", kode: "CN" },
  JAPAN: { navn: "Japan", kode: "JP" },
  THAILAND: { navn: "Thailand", kode: "TH" },
  USA: { navn: "USA", kode: "US" },
};

const FEILMELDING_LAND = "Du må velge land";

test.describe("FTRL Inngang - arbeidsland", () => {
  let mock: FtrlInngangMock;
  let inngang: FtrlInngangPage;

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test.beforeEach(async ({ page }) => {
    mock = await mockFtrlInngang(page, { landkoder: [LAND.KINA.kode, LAND.JAPAN.kode] });
    inngang = new FtrlInngangPage(page);
    await inngang.goto(mock.url);
  });

  test("viser lagrede land og sender endrede land ved bekreft", async () => {
    await inngang.verifiserValgteArbeidsland([LAND.KINA.navn, LAND.JAPAN.navn]);

    await inngang.fjernArbeidsland(LAND.JAPAN.navn);
    await inngang.velgArbeidsland(LAND.THAILAND.navn, "Thai");
    await inngang.verifiserValgteArbeidsland([LAND.KINA.navn, LAND.THAILAND.navn]);

    const lagret = await inngang.bekreftOgHentLagring();

    expect(lagret.mottatteOpplysninger.data.soeknadsland).toEqual({
      landkoder: [LAND.KINA.kode, LAND.THAILAND.kode],
      flereLandUkjentHvilke: false,
    });
    expect(lagret.arbeidsland).toEqual({ arbeidsland: [LAND.KINA.kode, LAND.THAILAND.kode] });
  });

  test("krever minst ett land", async () => {
    await inngang.fjernArbeidsland(LAND.KINA.navn);
    await inngang.fjernArbeidsland(LAND.JAPAN.navn);

    await inngang.verifiserFeilmelding(FEILMELDING_LAND);
    await inngang.verifiserKanIkkeFortsette();

    await inngang.velgArbeidsland(LAND.KINA.navn);

    await inngang.verifiserIngenFeilmelding(FEILMELDING_LAND);
    await inngang.verifiserKanFortsette();
  });

  test("viser advarsel når et EØS- eller avtaleland er valgt", async () => {
    await inngang.verifiserAvtalelandAdvarsel(false);

    await inngang.velgArbeidsland(LAND.USA.navn);
    await inngang.verifiserAvtalelandAdvarsel(true);

    await inngang.fjernArbeidsland(LAND.USA.navn);
    await inngang.verifiserAvtalelandAdvarsel(false);
  });
});
