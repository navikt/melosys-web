import MKV from "../../../../melosyskodeverk";
import VurderingUtpekt from "./vurderingUtpekt";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../../services/modules/kontroll", () => ({
  erBucAapen: () => Promise.resolve(true),
}));

vi.mock("../../../../utils", async () => {
  const actual = await vi.importActual("../../../../utils");
  return {
    ...actual,
    _uuid: () => "321",
  };
});

vi.mock("nav-frontend-js-utils", async () => {
  const actual = await vi.importActual("nav-frontend-js-utils");
  return {
    ...actual,
    guid: () => "123",
  };
});

// TODO: Skriv om når aksel tas inn i prosjektet.
describe.skip("VurderingUtpekt", () => {
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
      slettData: vi.fn(),
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      redigerbart: true,
      tilstand: {
        harAvklaring: true,
        lovvalgsbestemmelse: "Lovvalgsbestemmelse",
      },
      oppdaterData: vi.fn(),
      handleSubmit: vi.fn(),
      formValues: {},
      lovvalgsperiode: { fom: "", tom: "" },
      behandlingstema: MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
      behandlingID: 1,
      endreFelt: vi.fn(),
    };
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<VurderingUtpekt {...props} />, { preloadedState: initialState() });
    expect(container).toMatchSnapshot();
  });
});
