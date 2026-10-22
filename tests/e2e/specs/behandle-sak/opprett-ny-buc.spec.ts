import { test, expect } from "../../recording/fixtures";
import { OpprettNyBucPage } from "../../pages/behandling/opprett-ny-buc.page";
import { MOTTAKERINSTITUSJONER, mockOpprettNyBuc } from "../../mocks/opprettNyBucMock";
import { FtrlInngangMock } from "../../mocks/ftrlInngangMock";

/**
 * E2E-tester for «Opprett ny BUC» i sidepanelet på en behandling.
 *
 * Land og mottakerinstitusjoner var tidligere react-select multiselect og er byttet til Aksel Combobox.
 * Testene verifiserer validering, at mottakerinstitusjoner hentes for valgte land, og at valgte
 * institusjoner sendes i POST /api/eessi/bucer/{id}/opprett.
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/opprettNyBucMock.ts).
 */

const BUC = "LA_BUC_02";
const LAND = { SVERIGE: "Sverige", DANMARK: "Danmark" };
const [SE, DK] = MOTTAKERINSTITUSJONER;
const institusjon = ({ landkode, navn }: { landkode: string; navn: string }) => `${landkode} - ${navn}`;

const FEILMELDING = {
  BUC: "Du må velge BUC",
  LAND: "Du må velge land",
  MOTTAKERINSTITUSJON: "Du må velge mottakerinstitusjon",
};

test.describe("Opprett ny BUC", () => {
  let mock: FtrlInngangMock;
  let buc: OpprettNyBucPage;

  test.beforeEach(async ({ page }) => {
    mock = await mockOpprettNyBuc(page);
    buc = new OpprettNyBucPage(page);
    await buc.goto(mock.url);
  });

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test("krever BUC, land og mottakerinstitusjon", async () => {
    await buc.klikkOpprett();
    await buc.verifiserFeilmeldinger([FEILMELDING.BUC, FEILMELDING.LAND, FEILMELDING.MOTTAKERINSTITUSJON]);

    await buc.velgBuc(BUC);
    await buc.velg("Land", LAND.SVERIGE, "sve");
    await buc.verifiserIngenFeilmelding(FEILMELDING.LAND);

    await buc.fjern("Land", LAND.SVERIGE);
    await buc.verifiserFeilmeldinger([FEILMELDING.LAND]);
  });

  test("henter mottakerinstitusjoner for valgte land og sender valgte institusjoner", async () => {
    await buc.velgBuc(BUC);
    await buc.velg("Land", LAND.SVERIGE, "sve");
    await buc.verifiserValgmuligheter("Mottakerinstitusjoner", [institusjon(SE)]);

    await buc.velg("Land", LAND.DANMARK, "dan");
    await buc.verifiserValgte("Land", [LAND.SVERIGE, LAND.DANMARK]);
    await buc.verifiserValgmuligheter("Mottakerinstitusjoner", [institusjon(SE), institusjon(DK)]);

    await buc.velg("Mottakerinstitusjoner", institusjon(SE), "swe");
    await buc.velg("Mottakerinstitusjoner", institusjon(DK), "udb");
    await buc.verifiserValgte("Mottakerinstitusjoner", [institusjon(SE), institusjon(DK)]);
    await buc.verifiserIngenFeilmelding(FEILMELDING.MOTTAKERINSTITUSJON);

    const payload = await buc.opprettOgHentRequest();

    expect(payload).toEqual({ bucType: BUC, mottakerInstitusjoner: [SE.id, DK.id], vedlegg: [] });
    await buc.verifiserValgte("Land", []);
    await buc.verifiserValgte("Mottakerinstitusjoner", []);
  });
});
