import { VurderingArbeidsmonster } from "./vurderingArbeidsmonster";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

vi.mock("nav-frontend-js-utils", async () => {
  const actual = await vi.importActual("nav-frontend-js-utils");
  return {
    ...actual,
    guid: () => "123",
  };
});

// TODO: Skriv om når aksel tas inn i prosjektet. MELOSYS-6021
describe.skip("VurderingArbeidsmonster", () => {
  let props = null;

  const initialReduxState = {
    form: {
      soknad: {
        initial: {
          soknadsland: {
            flereLandUkjentHvilke: true,
          },
        },
        values: {
          soknadsland: {
            flereLandUkjentHvilke: true,
          },
        },
      },
    },
  };

  beforeEach(() => {
    props = {
      begrunnelser: [],
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
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
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
      arbeidsland: [],
      resetForm: vi.fn(),
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<VurderingArbeidsmonster {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(container).toMatchSnapshot();
  });
});
