import * as redux from "react-redux";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { DialogboksAvslagSoknad } from "./dialogboksAvslagSoknad";

describe("DialogboksAvslagSoknad", () => {
  const props = {
    avbryt: vi.fn(),
    avslaaSoknadHandle: vi.fn(),
    ariaHideApp: false,
    redigerbart: true,
    behandlingID: 1,
    dispatch: vi.fn(),
    kontrollerFerdigbehandling: vi.fn(),
    vedtakstype: null,
    feilmeldinger: [],
    kontrollfeil: [],
  };
  const doNothing = vi.fn(() => null);

  beforeAll(() => {
    vi.spyOn(redux, "useDispatch").mockImplementation(() => doNothing as never);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("viser en Nav Modal", () => {
    const { getByRole } = renderWithProviders(<DialogboksAvslagSoknad {...props} />);
    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("viser forhåndsvisning når ingen feilmeldinger finnes", async () => {
    const initialState = { behandlinger: { status: "", data: { redigerbart: true } } };
    const { findByText } = renderWithProviders(<DialogboksAvslagSoknad {...props} />, { preloadedState: initialState });
    expect(await findByText("Forhåndsvis vedtaksbrev")).toBeInTheDocument();
  });

  it("viser ikke forhåndsvisning når feilmeldinger finnes", async () => {
    const initialState = {
      behandlinger: { status: "", data: { redigerbart: true } },
      kontroll: { status: "OK", data: { kontrollfeilList: [{ kode: "Kode", term: "term" }] } },
    };

    const { queryByText } = renderWithProviders(<DialogboksAvslagSoknad {...props} />, {
      preloadedState: initialState,
    });
    expect(queryByText("Forhåndsvis vedtaksbrev")).not.toBeInTheDocument();
  });
});
