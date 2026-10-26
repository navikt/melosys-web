import { test, expect } from "../../../recording/fixtures";
import { EosUnntaksperioderPage } from "../../../pages/behandling/eos-unntaksperioder.page";
import { EosRegistreringUnntakMock, mockEosRegistreringUnntak } from "../../../mocks/eosRegistreringUnntakMock";

/**
 * E2E-tester for begrunnelser ved «Ikke godkjenn» av unntaksperiode (EU/EØS, mottatt A009).
 *
 * Begrunnelsene var tidligere en egenutviklet multiselect-dropdown og er byttet ut med
 * checkboxer. Testene verifiserer at nøyaktig de avkryssede begrunnelsene sendes i
 * POST /api/saksflyt/unntaksperioder/{id}/ikkegodkjenn.
 *
 * Dekker også MELOSYS-8373: fjernet fritekst skal ikke sendes, og ingen vurdering skal være
 * valgt før saksbehandler velger (eller en lagret vurdering forhåndsvelges).
 *
 * All backend-kommunikasjon er mocket med page.route (se mocks/eosRegistreringUnntakMock.ts).
 */

const VURDERING = {
  ENDRE_PERIODE: "Godkjenn, men endre periode",
  IKKE_GODKJENN: "Ikke godkjenn",
};

const BEGRUNNELSE = {
  OVER_24_MD: { label: "Utsendelseperioden overskrider 24 md", kode: "UTSENDELSE_OVER_24_MD" },
  TREDJELANDSBORGER: { label: "Tredjelandsborger fra et ikke-avtaleland", kode: "TREDJELANDSBORGER_IKKE_AVTALELAND" },
  ANNET: { label: "Fritekst", kode: "ANNET" },
};

test.describe("EU/EØS Registrering av unntaksperioder - begrunnelser for ikke godkjent", () => {
  let mock: EosRegistreringUnntakMock;
  let unntaksperioder: EosUnntaksperioderPage;

  test.afterEach(() => {
    expect(mock.ikkeMockedeKall, "Kall uten mock").toEqual([]);
  });

  test("ingen vurdering er valgt før saksbehandler velger", async ({ page }) => {
    mock = await mockEosRegistreringUnntak(page);
    unntaksperioder = new EosUnntaksperioderPage(page);
    await unntaksperioder.goto(mock.url);

    await unntaksperioder.verifiserValgtVurdering(null);
    await unntaksperioder.verifiserBegrunnelserSkjult();
    await unntaksperioder.verifiserLagreDeaktivert();
  });

  test("forhåndsvelger lagret «Ikke godkjenn» med begrunnelser", async ({ page }) => {
    mock = await mockEosRegistreringUnntak(page, {
      begrunnelseKoder: [BEGRUNNELSE.OVER_24_MD.kode, BEGRUNNELSE.ANNET.kode],
      begrunnelseFritekst: "Lagret begrunnelse",
    });
    unntaksperioder = new EosUnntaksperioderPage(page);
    await unntaksperioder.goto(mock.url);

    await unntaksperioder.verifiserValgtVurdering(VURDERING.IKKE_GODKJENN);
    await unntaksperioder.verifiserAvkryssedeBegrunnelser([BEGRUNNELSE.OVER_24_MD.label, BEGRUNNELSE.ANNET.label]);
    await unntaksperioder.verifiserFritekst("Lagret begrunnelse");
  });

  test.describe("etter valgt «Ikke godkjenn»", () => {
    test.beforeEach(async ({ page }) => {
      mock = await mockEosRegistreringUnntak(page);
      unntaksperioder = new EosUnntaksperioderPage(page);
      await unntaksperioder.goto(mock.url);
      await unntaksperioder.velgVurdering(VURDERING.IKKE_GODKJENN);
    });

    test("krever minst én begrunnelse", async () => {
      await unntaksperioder.verifiserAvkryssedeBegrunnelser([]);
      await unntaksperioder.lagre();

      await unntaksperioder.verifiserFeilmelding("Begrunnelse for avslag er påkrevd");
      expect(mock.ikkeGodkjennKall, "ikkegodkjenn skal ikke sendes uten begrunnelse").toEqual([]);
    });

    test("sender kun avkryssede begrunnelser", async () => {
      await unntaksperioder.kryssAvBegrunnelser([BEGRUNNELSE.OVER_24_MD.label, BEGRUNNELSE.TREDJELANDSBORGER.label]);
      await unntaksperioder.fjernBegrunnelser([BEGRUNNELSE.OVER_24_MD.label]);
      await unntaksperioder.verifiserAvkryssedeBegrunnelser([BEGRUNNELSE.TREDJELANDSBORGER.label]);
      await unntaksperioder.verifiserFritekstSkjult();

      const payload = await unntaksperioder.lagreOgHentIkkeGodkjenn();

      expect(payload).toEqual({
        ikkeGodkjentBegrunnelseKoder: [BEGRUNNELSE.TREDJELANDSBORGER.kode],
        begrunnelseFritekst: "",
      });
    });

    test("Fritekst krever utfylt begrunnelse", async () => {
      await unntaksperioder.kryssAvBegrunnelser([BEGRUNNELSE.OVER_24_MD.label, BEGRUNNELSE.ANNET.label]);
      await unntaksperioder.verifiserFritekstSynlig();

      await unntaksperioder.lagre();
      await unntaksperioder.verifiserFeilmelding("Fritekstfelt er påkrevd");

      await unntaksperioder.fyllUtFritekst("Mangler dokumentasjon");
      const payload = await unntaksperioder.lagreOgHentIkkeGodkjenn();

      expect({ ...payload, ikkeGodkjentBegrunnelseKoder: [...payload.ikkeGodkjentBegrunnelseKoder].sort() }).toEqual({
        ikkeGodkjentBegrunnelseKoder: [BEGRUNNELSE.ANNET.kode, BEGRUNNELSE.OVER_24_MD.kode],
        begrunnelseFritekst: "Mangler dokumentasjon",
      });
    });

    test("bytte av vurdering nullstiller begrunnelsene", async () => {
      await unntaksperioder.kryssAvBegrunnelser([BEGRUNNELSE.OVER_24_MD.label, BEGRUNNELSE.TREDJELANDSBORGER.label]);

      await unntaksperioder.velgVurdering(VURDERING.ENDRE_PERIODE);
      await unntaksperioder.verifiserBegrunnelserSkjult();

      await unntaksperioder.velgVurdering(VURDERING.IKKE_GODKJENN);
      await unntaksperioder.verifiserAvkryssedeBegrunnelser([]);

      await unntaksperioder.kryssAvBegrunnelser([BEGRUNNELSE.OVER_24_MD.label]);
      const payload = await unntaksperioder.lagreOgHentIkkeGodkjenn();

      expect(payload).toEqual({
        ikkeGodkjentBegrunnelseKoder: [BEGRUNNELSE.OVER_24_MD.kode],
        begrunnelseFritekst: "",
      });
    });

    test("sender ikke fritekst når Fritekst er fjernet", async () => {
      await unntaksperioder.kryssAvBegrunnelser([BEGRUNNELSE.OVER_24_MD.label, BEGRUNNELSE.ANNET.label]);
      await unntaksperioder.fyllUtFritekst("Skal ikke sendes");
      await unntaksperioder.fjernBegrunnelser([BEGRUNNELSE.ANNET.label]);
      await unntaksperioder.verifiserFritekstSkjult();

      const payload = await unntaksperioder.lagreOgHentIkkeGodkjenn();

      expect(payload).toEqual({
        ikkeGodkjentBegrunnelseKoder: [BEGRUNNELSE.OVER_24_MD.kode],
        begrunnelseFritekst: "",
      });
    });
  });
});
