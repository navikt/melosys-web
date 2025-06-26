import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { DialogboksAvslagSoknad } from "./dialogboksAvslagSoknad";
import { waitFor } from "@testing-library/react";

// Mock react-redux useDispatch hook
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe("DialogboksAvslagSoknad", () => {
  const props = {
    avbryt: vi.fn(),
    ariaHideApp: false,
    redigerbart: true,
    behandlingID: 1,
    dispatch: vi.fn(),
    kontrollerFerdigbehandling: vi.fn(),
    vedtakstype: null,
    feilmeldinger: [],
    kontrollfeil: [],
  };

  it("viser en Nav Modal", async () => {
    const { getByRole } = renderWithProviders(<DialogboksAvslagSoknad {...props} />);
    await waitFor(() => {
      expect(getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("viser forhåndsvisning når ingen feilmeldinger finnes", async () => {
    const initialState = { behandlinger: { status: "", data: { redigerbart: true } } };
    const { findByText } = renderWithProviders(<DialogboksAvslagSoknad {...props} />, { preloadedState: initialState });
    expect(await findByText("Forhåndsvisning av brev")).toBeInTheDocument();
  });

  it("viser ikke forhåndsvisning når feilmeldinger finnes", async () => {
    const initialState = {
      behandlinger: { status: "", data: { redigerbart: true } },
      kontroll: { status: "OK", data: { kontrollfeilList: [{ kode: "Kode", term: "term" }] } },
    };

    const { queryByText } = renderWithProviders(<DialogboksAvslagSoknad {...props} />, {
      preloadedState: initialState,
    });

    await waitFor(() => {
      expect(queryByText("Forhåndsvisning av brev")).not.toBeInTheDocument();
    });
  });
});
