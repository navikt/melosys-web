import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { MELOSYS_TILDEL_OPPGAVE } from "../../featuretoggle/toggleNavn";
import TilordnetSaksbehandler from "./tilordnetSaksbehandler";

const render = (behandlingData: Record<string, unknown>, toggleEnabled = true) =>
  renderWithProviders(<TilordnetSaksbehandler />, {
    preloadedState: {
      behandlinger: { data: { tildelingTilgjengelig: true, ...behandlingData } },
      featureToggle: { status: "OK", data: { [MELOSYS_TILDEL_OPPGAVE]: toggleEnabled } },
    },
  });

describe("TilordnetSaksbehandler", () => {
  it("viser ingenting når toggelen er av", () => {
    const { container } = render({ tilordnetNavn: "Ola Nordmann" }, false);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([false, true])("viser fullt navn uten knapp, tilordnetMeg=%s", (tilordnetMeg) => {
    render({ tilordnetNavn: "Ola Nordmann", tilordnetMeg });
    expect(screen.getByText("Saksbehandler:")).toBeInTheDocument();
    expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
    expect(screen.queryByText("Meg")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("viser Ikke tildelt for en utildelt oppgave", () => {
    render({ tilordnetNavn: null, tilordnetMeg: false });
    expect(screen.getByText("Ikke tildelt")).toBeInTheDocument();
  });

  it("viser utilgjengelig tildeling når oppgaven ikke kunne hentes", () => {
    render({ tildelingTilgjengelig: false, tilordnetNavn: null });
    expect(screen.getByText("Tildeling utilgjengelig")).toBeInTheDocument();
    expect(screen.queryByText("Ikke tildelt")).not.toBeInTheDocument();
  });
});
