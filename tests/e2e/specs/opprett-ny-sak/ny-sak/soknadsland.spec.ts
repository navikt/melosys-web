import { test, expect } from "../../../recording/fixtures";
import { OpprettSakLandPage } from "../../../pages/opprett-ny-sak/opprett-sak-land.page";
import { BRUKER_ID, mockOpprettSak, OpprettSakMock } from "../../../mocks/opprettSakMock";

/**
 * E2E-tester for landvalget ved opprettelse av en ny EU/EØS-sak.
 *
 * Land var tidligere react-select multiselect og er byttet til Aksel Combobox.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/opprettSakMock.ts).
 */

const UTSENDT_ARBEIDSTAKER = "Utsendt arbeidstaker / skip / direkte til artikkel 16";
const ARBEID_FLERE_LAND = "Arbeid og/eller selvstendig virksomhet i flere land";
const LAND = { SVERIGE: "Sverige", FINLAND: "Finland", DANMARK: "Danmark" };

test.describe("Land ved opprettelse av EU/EØS-sak", () => {
  let mock: OpprettSakMock;
  let landvalg: OpprettSakLandPage;

  test.beforeEach(async ({ page }) => {
    mock = await mockOpprettSak(page);
    landvalg = new OpprettSakLandPage(page);
  });

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test("oppretter sak med landene i valgt rekkefølge", async () => {
    await landvalg.gåTilLandvalg(mock.url, BRUKER_ID, ARBEID_FLERE_LAND);
    await landvalg.settPeriode("05.11.2027", "30.11.2027");
    await landvalg.velg(LAND.SVERIGE, "sve");
    await landvalg.velg(LAND.FINLAND, "fin");
    await landvalg.verifiserValgte([LAND.SVERIGE, LAND.FINLAND]);
    await landvalg.opprett();

    await expect.poll(mock.opprettetSak).toMatchObject({
      soknadDto: {
        periode: { fom: "2027-11-05", tom: "2027-11-30" },
        land: { landkoder: ["SE", "FI"], flereLandUkjentHvilke: false },
      },
    });
  });

  test("fjerner land med slett-knappen og Backspace", async () => {
    await landvalg.gåTilLandvalg(mock.url, BRUKER_ID, UTSENDT_ARBEIDSTAKER);
    await landvalg.velg(LAND.SVERIGE, "sve");
    await landvalg.velg(LAND.DANMARK, "dan");
    await landvalg.velg(LAND.FINLAND, "fin");

    await landvalg.fjern(LAND.DANMARK);
    await landvalg.verifiserValgte([LAND.SVERIGE, LAND.FINLAND]);

    await landvalg.fjernSisteMedBackspace();
    await landvalg.verifiserValgte([LAND.SVERIGE]);
  });

  test("Utsendt arbeidstaker krever minst ett land", async () => {
    await landvalg.gåTilLandvalg(mock.url, BRUKER_ID, UTSENDT_ARBEIDSTAKER);
    await landvalg.opprett();
    await landvalg.verifiserFeilmelding("Velg minst ett land");

    await landvalg.velg(LAND.SVERIGE, "sve");
    await landvalg.verifiserIngenFeilmelding("Velg minst ett land");
    await landvalg.opprett();

    await expect.poll(mock.opprettetSak).toMatchObject({
      soknadDto: { land: { landkoder: ["SE"] } },
    });
  });

  test("Arbeid i flere land krever minst to land, eller «Flere land. Ikke kjent hvilke»", async () => {
    await landvalg.gåTilLandvalg(mock.url, BRUKER_ID, ARBEID_FLERE_LAND);
    await landvalg.velg(LAND.SVERIGE, "sve");
    await landvalg.opprett();
    await landvalg.verifiserFeilmelding("Velg minst to land");
    await landvalg.verifiserFlereLandUkjentHvilkeKanVelges(false);

    await landvalg.fjern(LAND.SVERIGE);
    await landvalg.verifiserFlereLandUkjentHvilkeKanVelges(true);
    await landvalg.velgFlereLandUkjentHvilke();
    await landvalg.opprett();

    await expect.poll(mock.opprettetSak).toMatchObject({
      soknadDto: { land: { landkoder: [], flereLandUkjentHvilke: true } },
    });
  });
});
