import { screen } from "@testing-library/react";
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

  it("viser en Nav Modal", () => {
    renderWithProviders(<DialogboksAvslagSoknad {...props} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("viser forhåndsvisning når ingen feilmeldinger finnes", async () => {
    const initialState = { behandlinger: { status: "", data: { redigerbart: true } } };
    renderWithProviders(<DialogboksAvslagSoknad {...props} />, { preloadedState: initialState });
    expect(await screen.findByText("Forhåndsvis vedtaksbrev")).toBeInTheDocument();
  });

  it("viser ikke forhåndsvisning når feilmeldinger finnes", async () => {
    const doNothing = vi.fn(() => null);
    vi.spyOn(redux, "useDispatch").mockImplementation(() => doNothing as never);
    const initialState = {
      behandlinger: { status: "", data: { redigerbart: true } },
      kontroll: { status: "OK", data: { kontrollfeilList: [{ kode: "Kode", term: "term" }] } },
    };

    renderWithProviders(<DialogboksAvslagSoknad {...props} />, { preloadedState: initialState });
    let error = null;
    try {
      await screen.findAllByText("Forhåndsvis vedtaksbrev");
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });
});
