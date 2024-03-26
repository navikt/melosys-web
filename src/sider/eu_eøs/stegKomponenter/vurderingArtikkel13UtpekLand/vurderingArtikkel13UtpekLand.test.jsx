import { VurderingArtikkel13UtpekLand } from "./vurderingArtikkel13UtpekLand";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";
import * as KV from "../../../../kodeverk";

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));
vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

// TODO: Skriv om når aksel tas inn i prosjektet. MELOSYS-6021
/* eslint-disable react/jsx-pascal-case */
describe.skip("VurderingArtikkel13_1_UtpekLand", () => {
  const props = {
    tilstand: {
      overskrift: "Omfattet av norsk lovgivning, etter artikkel 13, nr 1, b",
    },
    redigerbart: true,
    behandlingID: 3,
    lovvalgsland: "NO",
    lagreOgUtpek: vi.fn(),
    tilbake: vi.fn(),
    formIsValid: true,
    touch: vi.fn(),
    form: "Form",
    touchAll: vi.fn(),
    erOffentligArbeidUtland: true,
    harLonnetArbeidAnnetLand: true,
    oppdaterData: vi.fn(),
    slettData: vi.fn(),
    lagreUtpekingsperioder: vi.fn(),
    formValues: {
      forkortUtpekingsperiode: true,
    },
    utpekingsperiode: {},
    byggUtpekingsperioder: vi.fn(),
    endreUtpekingsperiode: vi.fn(),
    soknadsperiode: {},
    ikkeMarginaleArbeidsland: [],
    oppdaterMottakerinstitusjoner: vi.fn(),
    landMedVesentligEllerRegistrertArbeid: [],
  };

  it("snapshot test", () => {
    const WrappedVurderingArtikkel13UtpekLand = reduxForm({ form: KV.Form.ARTIKKEL_13_UTPEKLAND })(
      VurderingArtikkel13UtpekLand
    );
    const { container } = renderWithProviders(<WrappedVurderingArtikkel13UtpekLand {...props} />);
    expect(container).toMatchSnapshot();
  });
});
