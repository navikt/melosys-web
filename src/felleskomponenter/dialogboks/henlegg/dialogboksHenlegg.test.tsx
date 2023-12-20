import * as redux from "react-redux";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { DialogboksHenleggSak } from "./dialogboksHenlegg";

describe("Dialogbokshenlegg", () => {
  const props = {
    ariaHideApp: false,
    avbryt: vi.fn(),
  };
  const doNothing = vi.fn(() => null);

  beforeAll(() => {
    vi.spyOn(redux, "useDispatch").mockImplementation(() => doNothing as never);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("viser en Nav Modal", () => {
    const { getByRole } = renderWithProviders(<DialogboksHenleggSak {...props} />);
    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("viser forhåndsvisning når ingen feilmeldinger finnes", () => {
    const { getByText } = renderWithProviders(<DialogboksHenleggSak {...props} />);
    expect(getByText("Forhåndsvis brev")).toBeInTheDocument();
  });

  it("viser ikke forhåndsvisning når feilmeldinger finnes", () => {
    const initialState = {
      kontroll: { status: "OK", data: { kontrollfeilList: [{ kode: "Kode", term: "term", type: "FEIL" }] } },
    };

    const { queryAllByText } = renderWithProviders(<DialogboksHenleggSak {...props} />, {
      preloadedState: initialState,
    });
    expect(queryAllByText("Forhåndsvis brev")).toHaveLength(0);
  });
});
