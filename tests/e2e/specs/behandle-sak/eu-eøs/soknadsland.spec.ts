import { test, expect } from "../../../recording/fixtures";
import { SoknadslandPage } from "../../../pages/behandling/soknadsland.page";
import { EuEosArbeidFlereLandMock, mockEuEosArbeidFlereLand } from "../../../mocks/euEosArbeidFlereLandMock";

/**
 * E2E-tester for redigering av søknadsland i menypunktet «Periode og land» på en EU/EØS-behandling.
 *
 * Land var tidligere react-select multiselect og er byttet til Aksel Combobox.
 * Menypanelet autolagrer mottatte opplysninger ved endring, og «Lagre» oppfrisker registeropplysninger.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/euEosArbeidFlereLandMock.ts).
 */

const LAND = { SVERIGE: "Sverige", FINLAND: "Finland", DANMARK: "Danmark" };
const FLERE_LAND_UKJENT_HVILKE = "Flere land. Ikke kjent hvilke.";

test.describe("Søknadsland i menypanelet", () => {
  let mock: EuEosArbeidFlereLandMock;
  let soknadsland: SoknadslandPage;

  test.beforeEach(async ({ page }) => {
    mock = await mockEuEosArbeidFlereLand(page);
    soknadsland = new SoknadslandPage(page);
    await soknadsland.goto(mock.url);
  });

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test("lagrer valgte land og oppfrisker registeropplysninger", async () => {
    await soknadsland.verifiserLagredeLand("Sverige og Finland");

    await soknadsland.rediger();
    await soknadsland.verifiserValgte([LAND.SVERIGE, LAND.FINLAND]);
    await soknadsland.velg(LAND.DANMARK, "dan");
    await soknadsland.fjern(LAND.SVERIGE);
    await soknadsland.verifiserValgte([LAND.FINLAND, LAND.DANMARK]);
    await soknadsland.lagre();

    await soknadsland.verifiserLagredeLand("Finland og Danmark");
    await expect.poll(mock.lagretSoeknadsland).toEqual({ landkoder: ["FI", "DK"], flereLandUkjentHvilke: false });
    await expect.poll(mock.antallOppfriskninger).toBe(1);
  });

  test("Backspace fjerner sist valgte land", async () => {
    await soknadsland.rediger();
    await soknadsland.velg(LAND.DANMARK, "dan");
    await soknadsland.fjernSisteMedBackspace();

    await soknadsland.verifiserValgte([LAND.SVERIGE, LAND.FINLAND]);
  });

  test("Avbryt forkaster endringer", async () => {
    await soknadsland.rediger();
    await soknadsland.velg(LAND.DANMARK, "dan");
    await soknadsland.fjern(LAND.SVERIGE);
    await soknadsland.avbryt();

    await soknadsland.verifiserLagredeLand("Sverige og Finland");
    await expect.poll(mock.lagretSoeknadsland).toEqual({ landkoder: ["SE", "FI"], flereLandUkjentHvilke: false });

    await soknadsland.rediger();
    await soknadsland.verifiserValgte([LAND.SVERIGE, LAND.FINLAND]);
  });

  test("«Flere land. Ikke kjent hvilke.» kan bare velges uten land, og deaktiverer landvalget", async () => {
    await soknadsland.rediger();
    await soknadsland.klikkFlereLandUkjentHvilke();
    await soknadsland.verifiserFlereLandUkjentHvilke(false);

    await soknadsland.fjern(LAND.SVERIGE);
    await soknadsland.fjern(LAND.FINLAND);
    await soknadsland.klikkFlereLandUkjentHvilke();
    await soknadsland.verifiserFlereLandUkjentHvilke(true);
    await soknadsland.verifiserLandvelgerAktiv(false);
    await soknadsland.lagre();

    await soknadsland.verifiserLagredeLand(FLERE_LAND_UKJENT_HVILKE);
    await expect.poll(mock.lagretSoeknadsland).toEqual({ landkoder: [], flereLandUkjentHvilke: true });
  });
});
