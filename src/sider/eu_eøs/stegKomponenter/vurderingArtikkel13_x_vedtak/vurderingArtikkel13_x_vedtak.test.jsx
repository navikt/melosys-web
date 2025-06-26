import * as MKV from "@navikt/melosys-kodeverk";

import { reduxForm } from "redux-form";
import { VurderingArtikkel13_x_vedtak } from "./vurderingArtikkel13_x_vedtak";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { fireEvent } from "@testing-library/react";
import * as KV from "../../../../kodeverk";

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("VurderingArtikkel13_x_Vedtak", () => {
  const props = {
    tilstand: {
      overskrift: "Omfattet av norsk lovgivning, etter artikkel 13, nr 1, a",
    },
    redigerbart: true,
    behandlingID: 4,
    lovvalgsperiode: {},
    endreLovvalgsPeriode: vi.fn(),
    tilbake: vi.fn(),
    formIsValid: true,
    formValues: {},
    form: "form",
    touchAll: vi.fn(),
    handleSubmit: vi.fn(),
    byggLovvalgsperioder: vi.fn(),
    lagreLovvalgsperioder: vi.fn(),
    kontrollerFerdigbehandling: vi.fn(),
    behandlingstype: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
    harLandSomKreverSED: true,
    soknadsperiode: { tom: "", fom: "" },
    validerMottatteOpplysninger: vi.fn(),
    fattVedtak: vi.fn(),
    harFeilmeldinger: false,
    mottatteOpplysningerStatus: "OK",
  };

  const WrappedVurderingArtikkel13_x_vedtak = reduxForm({ form: KV.Form.ARTIKKEL_13_X_VEDTAK })(
    VurderingArtikkel13_x_vedtak,
  );

  it("kaller handleSubmit ved submit-event", () => {
    const { container } = renderWithProviders(<WrappedVurderingArtikkel13_x_vedtak {...props} />);
    fireEvent.submit(container.querySelector("form"));
    expect(props.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVurderingArtikkel13_x_vedtak {...props} />);
    expect(container).toMatchSnapshot();
  });
});
