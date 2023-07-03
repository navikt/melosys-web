import { VurderingArbeidsmonster } from "./vurderingArbeidsmonster";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

jest.mock("nav-frontend-js-utils", () => ({
  ...jest.requireActual("nav-frontend-js-utils"),
  guid: () => "123",
}));

describe("VurderingArbeidsmonster", () => {
  let props = null;

  const initialReduxState = {
    form: {
      soknad: {
        initial: {
          soknadsland: {
            erUkjenteEllerAlleEosLand: true,
          },
        },
        values: {
          soknadsland: {
            erUkjenteEllerAlleEosLand: true,
          },
        },
      },
    },
  };

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      tilstand: {
        harAvklaring: true,
        marginaltArbeid: [],
        aktivitetINorge: {},
        aktivitetINorgeNodvendig: true,
        yrkesaktivitet: "",
        erArbeidstakerOgSelvstendigNaeringsdrivende: true,
        erOffentligTjenestemann: true,
        loennetArbeidAntallLandFakta: {},
        offentligArbeidAntallLandFakta: {},
        landMedVesentligArbeid: [],
        erNorgeValgt: true,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      arbeidsland: [],
      resetForm: jest.fn(),
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<VurderingArbeidsmonster {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(container).toMatchSnapshot();
  });
});
