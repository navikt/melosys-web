import * as Skjema from "../../../../felleskomponenter/skjema";
import MKV from "../../../../melosyskodeverk";
import VurderingUtpekt from "./vurderingUtpekt";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

jest.mock("../../../../services/modules/kontroll", () => ({
  erBucAapen: () => Promise.resolve(true),
}));
jest.mock("../../../../utils", () => ({
  ...jest.requireActual("../../../../utils"),
  _uuid: () => "321",
}));
jest.mock("nav-frontend-js-utils", () => ({
  ...jest.requireActual("nav-frontend-js-utils"),
  guid: () => "123",
}));

describe("VurderingUtpekt", () => {
  let props = null;

  const initialState = () => {
    return {
      behandlinger: {
        data: {
          oppsummering: {
            behandlingstema: {
              kode: MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
            },
          },
        },
      },
    };
  };

  beforeEach(() => {
    props = {
      vurderingBegrunnelser: ["Begrunnelse"],
      slettData: jest.fn(),
      bekreftOgFortsett: jest.fn(),
      tilbake: jest.fn(),
      redigerbart: true,
      tilstand: {
        harAvklaring: true,
        lovvalgsbestemmelse: "Lovvalgsbestemmelse",
      },
      oppdaterData: jest.fn(),
      handleSubmit: jest.fn(),
      formValues: {},
      lovvalgsperiode: { fom: "", tom: "" },
      behandlingstema: MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
      behandlingID: 1,
      endreFelt: jest.fn(),
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<VurderingUtpekt {...props} />, { preloadedState: initialState() });
    expect(container).toMatchSnapshot();
  });

  it("viser radiobuttons for godkjenning og avslag", () => {
    props.tilstand.utpekingGodkjent = true;
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const radios = vurderingUtpekt.find(Skjema.Radio);

    expect(radios).toHaveLength(2);
  });
});
