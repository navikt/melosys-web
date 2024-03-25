import MKV from "../../../../melosyskodeverk";

import { VurderingArtikkel16Vedtak } from "./vurderingArtikkel16Vedtak";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";
import * as KV from "../../../../kodeverk";

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("VurderingArtikkel16Vedtak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      anmodningsperiodesvar: {
        anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE,
        endretPeriode: { fom: "datofom", tom: "datotom" },
        begrunnelseFritekst: "fritekst",
      },
      behandlingID: 1,
      tilbake: vi.fn(),
      redigerbart: true,
      vilkarBegrunnelser: [],
      art_12_1_begrunnelser: [],
      art_12_2_begrunnelser: [],
      formIsValid: true,
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
      touch: vi.fn(),
      formValues: {
        vedtakstypebegrunnelse: MKV.Koder.begrunnelser.nyvurderingbakgrunner.FEIL_I_BEHANDLING,
        vedtakstype: MKV.Koder.vedtakstyper.KORRIGERINGSVEDTAK,
        vedtaksbrevFritekst: "Test",
      },
      harValgtNorskArbeidsgiver: true,
      hentLovvalgsperioder: vi.fn(),
      lagreLovvalgsperioder: vi.fn(),
      endreLovvalgsperiode: vi.fn(),
      kontrollerFerdigbehandling: vi.fn(),
      validerMottatteOpplysninger: vi.fn().mockImplementation(() => Promise.resolve()),
      fattVedtak: vi.fn(),
      harFeilmeldinger: false,
      mottatteOpplysningerStatus: "OK",
    };
  });

  const WrappedArtikkel16Vedtak = reduxForm({ form: KV.Form.ARTIKKEL_16_1_VEDTAK })(VurderingArtikkel16Vedtak);

  it("viser innvilgelse-komponent ved innvilgelse", () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE;
    renderWithProviders(<WrappedArtikkel16Vedtak {...props} />);
    const innvilgelseTekst = "Omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1.";
    expect(screen.getByText(innvilgelseTekst)).toBeInTheDocument();
  });

  it('viser "delvis innvilgelse"-komponent ved delvis innvilgelse', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;
    renderWithProviders(<WrappedArtikkel16Vedtak {...props} />);
    const delvisInnvilgelseTekst =
      "Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1. i deler av søknadsperioden";
    expect(screen.getByText(delvisInnvilgelseTekst)).toBeInTheDocument();
  });

  it("viser avslag-komponent ved avslag", () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.AVSLAG;
    renderWithProviders(<WrappedArtikkel16Vedtak {...props} />);
    const avslagTekst = "Avslag";
    expect(screen.getByText(avslagTekst)).toBeInTheDocument();
  });

  // TODO: Skriv om når aksel tas inn i prosjektet. MELOSYS-6021
  it.skip("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedArtikkel16Vedtak {...props} />);
    expect(container).toMatchSnapshot();
  });
});
