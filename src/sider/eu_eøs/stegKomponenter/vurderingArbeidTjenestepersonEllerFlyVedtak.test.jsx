import * as EKV from "eessi-kodeverk";

import { VurderingArbeidTjenestepersonEllerFlyVedtak } from "./vurderingArbeidTjenestepersonEllerFlyVedtak";
import Mottakerinstitusjonvelger, {
  MottakerinstitusjonvelgerFlervalg,
} from "../../../felleskomponenter/mottakerinstitusjonvelger";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";

import MKV from "../../../melosyskodeverk";

jest.mock("../../../featuretoggle", () => ({
  useFeatureToggle: jest.fn(),
}));

describe("VurderingArbeidTjenestepersonEllerFlyVedtak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      arbeidsland: [],
      behandlingID: 4,
      lovvalgsperiode: {},
      formIsValid: true,
      formValues: {},
      touchAll: jest.fn(),
      endreLovvalgsPeriode: jest.fn(),
      byggLovvalgsperioder: jest.fn(),
      lagreLovvalgsperioder: jest.fn(),
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      form: KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      handleSubmit: jest.fn(),
      mottatteOpplysningerFom: "",
      mottatteOpplysningerTom: "",
      soknadsperiode: { tom: "", fom: "" },
      harFeilmeldinger: false,
      kontrollerFerdigbehandling: jest.fn(),
      validerMottatteOpplysninger: jest.fn().mockImplementationOnce(() => Promise.resolve()),
      fattVedtak: jest.fn(),
      selvstendigArbeid: {
        erSelvstendig: false,
      },
    };
  });

  test("validerMottatteOpplysninger kalles ved submit av form", async () => {
    props.formValues.forkortLovvalgsperiode = false;
    props.formValues.vedtaksbrevFritekst = "vedtaksbrevfritekst";
    props.formValues.fritekstSed = "fritekst til SED";
    props.formValues.vedtakstypebegrunnelse = "begrunnelse for revurdering";
    props.formValues.vedtakstype = MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK;
    props.handleSubmit = (onSubmitCallback) => () => {
      onSubmitCallback({}, () => {}, props);
    };

    const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidTjenestepersonEllerFlyVedtak {...props} />);
    const form = vurderingArbeidEttLandOvrigVedtak.find("form");

    await form.props().onSubmit();

    expect(props.validerMottatteOpplysninger).toHaveBeenCalledTimes(1);
    expect(props.fattVedtak).toHaveBeenCalledTimes(1);
    expect(props.fattVedtak).toHaveBeenLastCalledWith(4, {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: "vedtaksbrevfritekst",
      fritekstSed: "fritekst til SED",
      mottakerinstitusjoner: null,
      vedtakstype: MKV.Koder.vedtakstyper.KORRIGERT_VEDTAK,
      nyVurderingBakgrunn: "begrunnelse for revurdering",
    });
  });

  describe("ved art11_5", () => {
    beforeEach(() => {
      props.formValues.lovvalgsbestemmelse =
        MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5;
    });

    describe("viser nødvendige felter dersom", () => {
      test("man velger å informere utenlandsk trygdemyndighet", () => {
        props.formValues.informerUtenlandskTrygdemyndighet = true;
        props.formValues.kreverMottakerinstitusjon = true;
        props.formValues.mottakerLand = MKV.Koder.landkoder.DE;

        const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidTjenestepersonEllerFlyVedtak {...props} />);

        const mottakerinstitusjoner = vurderingArbeidEttLandOvrigVedtak.find(Mottakerinstitusjonvelger);
        const ytterligereInformasjon = vurderingArbeidEttLandOvrigVedtak.findWhere(
          (n) => n.type() === Skjema.Textarea && n.props().label === "Ytterligere informasjon til SED (valgfri)"
        );
        const pdfLenkeListe = vurderingArbeidEttLandOvrigVedtak.find(PdfLenkeListe);

        expect(mottakerinstitusjoner).toHaveLength(1);
        expect(ytterligereInformasjon).toHaveLength(1);
        expect(pdfLenkeListe.props().dokumenter).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: EKV.Koder.sedtyper.A010,
            }),
          ])
        );
      });
    });

    describe("gjemmer unødvendige felter dersom", () => {
      test("man velger å informere utenlandsk trygdemyndighet, men ingen mottakerinstitusjoner finnes for valgt land", () => {
        props.formValues.informerUtenlandskTrygdemyndighet = true;
        props.formValues.kreverMottakerinstitusjon = false;
        const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidTjenestepersonEllerFlyVedtak {...props} />);

        const mottakerinstitusjoner = vurderingArbeidEttLandOvrigVedtak.find(Mottakerinstitusjonvelger);
        const ytterligereInformasjon = vurderingArbeidEttLandOvrigVedtak.findWhere(
          (n) => n.type() === Skjema.Textarea && n.props().label === "Ytterligere informasjon til SED (valgfri)"
        );
        const pdfLenkeListe = vurderingArbeidEttLandOvrigVedtak.find(PdfLenkeListe);

        expect(mottakerinstitusjoner).toHaveLength(0);
        expect(ytterligereInformasjon).toHaveLength(0);
        expect(pdfLenkeListe.props().dokumenter).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: EKV.Koder.sedtyper.A010,
            }),
          ])
        );
      });

      test("man velger å ikke informere utenlandsk trygdemyndighet", () => {
        props.formValues.informerUtenlandskTrygdemyndighet = false;
        const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidTjenestepersonEllerFlyVedtak {...props} />);

        const mottakerinstitusjoner = vurderingArbeidEttLandOvrigVedtak.find(Mottakerinstitusjonvelger);
        const ytterligereInformasjon = vurderingArbeidEttLandOvrigVedtak.findWhere(
          (n) => n.type() === Skjema.Textarea && n.props().label === "Ytterligere informasjon til SED (valgfri)"
        );
        const pdfLenkeListe = vurderingArbeidEttLandOvrigVedtak.find(PdfLenkeListe);

        expect(mottakerinstitusjoner).toHaveLength(0);
        expect(ytterligereInformasjon).toHaveLength(0);
        expect(pdfLenkeListe.props().dokumenter).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: EKV.Koder.sedtyper.A010,
            }),
          ])
        );
      });
    });
  });

  describe("ved 11_3B", () => {
    let vurderingArbeidEttLandOvrigVedtak = null;

    beforeEach(() => {
      props.formValues.lovvalgsbestemmelse =
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;
      vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidTjenestepersonEllerFlyVedtak {...props} />);
    });

    it("viser periodeforkorter", () => {
      expect(vurderingArbeidEttLandOvrigVedtak.find(Skjema.PeriodeForkorter)).toHaveLength(1);
    });

    it("viser fritekst til vedtaksbrev", () => {
      expect(
        vurderingArbeidEttLandOvrigVedtak.findWhere(
          (n) => n.type() === Skjema.Textarea && n.props().label === "Fritekst til vedtaksbrev"
        )
      ).toHaveLength(1);
    });

    it("viser mottakerinstitusjonsvelgerFlervalg", () => {
      expect(vurderingArbeidEttLandOvrigVedtak.find(MottakerinstitusjonvelgerFlervalg)).toHaveLength(1);
    });

    it("viser ytterligere informasjon til SED", () => {
      expect(
        vurderingArbeidEttLandOvrigVedtak.findWhere(
          (n) => n.type() === Skjema.Textarea && n.props().label === "Ytterligere informasjon til SED (valgfri)"
        )
      ).toHaveLength(1);
    });
  });
});
