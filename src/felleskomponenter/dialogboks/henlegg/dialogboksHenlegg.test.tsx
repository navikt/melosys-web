import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { DialogboksHenleggSak } from "./dialogboksHenlegg";

// Mock react-redux useDispatch hook
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

describe("Dialogbokshenlegg", () => {
  const props = {
    ariaHideApp: false,
    avbryt: vi.fn(),
  };

  it("viser en Nav Modal", () => {
    const { getByRole } = renderWithProviders(<DialogboksHenleggSak {...props} />);
    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("viser forhåndsvisning når ingen feilmeldinger finnes", () => {
    const { getByText } = renderWithProviders(<DialogboksHenleggSak {...props} />);
    expect(getByText("Forhåndsvisning av brev")).toBeInTheDocument();
  });

  it("viser ikke forhåndsvisning når feilmeldinger finnes", () => {
    const initialState = {
      kontroll: { status: "OK", data: { kontrollfeilList: [{ kode: "Kode", term: "term", type: "FEIL" }] } },
    };

    const { queryAllByText } = renderWithProviders(<DialogboksHenleggSak {...props} />, {
      preloadedState: initialState,
    });
    expect(queryAllByText("Forhåndsvisning av brev")).toHaveLength(0);
  });
});
