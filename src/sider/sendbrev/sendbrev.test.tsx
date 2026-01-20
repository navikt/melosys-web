import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route } from "react-router-dom";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import Sendbrev from "./sendbrev";

// Mock dependencies
vi.mock("../../felleskomponenter/informasjonlinje", () => ({
  default: () => <div>Informasjonlinje Mock</div>,
}));

vi.mock("../../felleskomponenter/sideDialog", () => ({
  SendBrev: () => <div>SendBrev Component Mock</div>,
}));

describe("Sendbrev", () => {
  const defaultPreloadedState = {
    form: {
      SEND_BREV: {
        values: {},
      },
    },
    dokumenter: { data: [] },
    behandlinger: { data: { redigerbart: true } },
  };

  const renderSendbrev = (behandlingID = "123", saksnummer = "12345678") => {
    return renderWithProviders(
      <MemoryRouter initialEntries={[`/sendbrev/${behandlingID}/${saksnummer}`]}>
        <Route path="/sendbrev/:behandlingID/:snr">
          <Sendbrev />
        </Route>
      </MemoryRouter>,
      {
        preloadedState: defaultPreloadedState,
      },
    );
  };

  it("skal rendre komponenten", () => {
    renderSendbrev();

    expect(screen.getByText("Informasjonlinje Mock")).toBeInTheDocument();
    expect(screen.getByText("SendBrev Component Mock")).toBeInTheDocument();
  });

  it("skal ha riktig CSS-klasse på hovedcontainer", () => {
    const { container } = renderSendbrev();

    const sendbrevContainer = container.querySelector(".sendbrev");
    expect(sendbrevContainer).toBeInTheDocument();
  });

  it("skal vise main-container", () => {
    const { container } = renderSendbrev();

    const mainContainer = container.querySelector("#main-container");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("main-container");
  });

  it("skal rendre med forskjellige behandlingID", () => {
    const { rerender } = renderSendbrev("999");

    expect(screen.getByText("SendBrev Component Mock")).toBeInTheDocument();

    // Rerender med ny behandlingID
    rerender(
      <MemoryRouter initialEntries={[`/sendbrev/888/12345678`]}>
        <Route path="/sendbrev/:behandlingID/:snr">
          <Sendbrev />
        </Route>
      </MemoryRouter>,
    );

    expect(screen.getByText("SendBrev Component Mock")).toBeInTheDocument();
  });

  it("skal rendre informasjonlinje uten behandlingsmeny", () => {
    renderSendbrev();

    // Informasjonslinje skal rendres
    expect(screen.getByText("Informasjonlinje Mock")).toBeInTheDocument();
  });

  it("skal håndtere ulike saksnumre", () => {
    renderSendbrev("123", "87654321");

    expect(screen.getByText("SendBrev Component Mock")).toBeInTheDocument();
  });

  it("skal rendre med dokumenter i state", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      dokumenter: {
        data: [
          { dokumentID: "1", tittel: "Test dokument" },
          { dokumentID: "2", tittel: "Test dokument 2" },
        ],
      },
    };

    renderWithProviders(
      <MemoryRouter initialEntries={[`/sendbrev/123/12345678`]}>
        <Route path="/sendbrev/:behandlingID/:snr">
          <Sendbrev />
        </Route>
      </MemoryRouter>,
      {
        preloadedState,
      },
    );

    expect(screen.getByText("SendBrev Component Mock")).toBeInTheDocument();
  });

  it("skal rendre med redigerbart = false", () => {
    const preloadedState = {
      ...defaultPreloadedState,
      behandlinger: { data: { redigerbart: false } },
    };

    renderWithProviders(
      <MemoryRouter initialEntries={[`/sendbrev/123/12345678`]}>
        <Route path="/sendbrev/:behandlingID/:snr">
          <Sendbrev />
        </Route>
      </MemoryRouter>,
      {
        preloadedState,
      },
    );

    expect(screen.getByText("SendBrev Component Mock")).toBeInTheDocument();
  });
});
