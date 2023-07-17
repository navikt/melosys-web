import { screen } from "@testing-library/react";
import * as redux from "react-redux";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { DialogboksHenleggSak } from "./dialogboksHenlegg";

describe("Dialogbokshenlegg", () => {
  const props = {
    ariaHideApp: false,
    avbryt: vi.fn(),
    henleggHandle: vi.fn(),
  };

  it("viser en Nav Modal", () => {
    renderWithProviders(<DialogboksHenleggSak {...props} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("viser forhåndsvisning når ingen feilmeldinger finnes", () => {
    renderWithProviders(<DialogboksHenleggSak {...props} />);
    expect(screen.getByText("Forhåndsvis brev")).toBeInTheDocument();
  });

  it("viser ikke forhåndsvisning når feilmeldinger finnes", () => {
    const doNothing = vi.fn(() => null);
    vi.spyOn(redux, "useDispatch").mockImplementation(() => doNothing as never);
    const initialState = { kontroll: { status: "OK", data: { kontrollfeilList: [{ kode: "Kode", term: "term" }] } } };

    renderWithProviders(<DialogboksHenleggSak {...props} />, { preloadedState: initialState });
    expect(screen.queryAllByText("Forhåndsvis brev")).toHaveLength(0);
  });
});
