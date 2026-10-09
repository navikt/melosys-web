import { Profiler } from "react";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, UnknownAction } from "@reduxjs/toolkit";
import { vi } from "vitest";
import ErrorBoundary from "./errorBoundary";

const lagStore = () =>
  configureStore({
    reducer: {
      oppgaver: (state = { status: "OK" }, action: UnknownAction) =>
        action.type === "oppgaver/feil" ? { status: "ERROR", data: "Feil fra server" } : state,
      annet: (state = { teller: 0 }, action: UnknownAction) =>
        action.type === "annet/oek" ? { teller: state.teller + 1 } : state,
    },
  });

const kontekster = [{ slice: "oppgaver", varselTekst: "Kunne ikke søke etter oppgaver" }];

const renderMedStore = (store: ReturnType<typeof lagStore>, onRender = vi.fn()) =>
  render(
    <Provider store={store}>
      <Profiler id="errorBoundary" onRender={onRender}>
        <ErrorBoundary kontekster={kontekster}>
          <div>Innhold</div>
        </ErrorBoundary>
      </Profiler>
    </Provider>,
  );

describe("ErrorBoundary", () => {
  it("viser innholdet når ingen kontekst har feil, uten advarsel om rot-state", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderMedStore(lagStore());

    expect(screen.getByText("Innhold")).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("returned the root state"), expect.anything());
    warn.mockRestore();
  });

  it("viser feilmelding når en kontekst har feil", () => {
    const store = lagStore();
    renderMedStore(store);

    act(() => {
      store.dispatch({ type: "oppgaver/feil" });
    });

    expect(screen.queryByText("Innhold")).not.toBeInTheDocument();
    expect(screen.getByText(/Feil fra server/)).toBeInTheDocument();
    expect(screen.getByText(/Kunne ikke søke etter oppgaver/)).toBeInTheDocument();
  });

  it("rendrer ikke på nytt når urelatert state endres", () => {
    const store = lagStore();
    const onRender = vi.fn();
    renderMedStore(store, onRender);
    const antallRendringer = onRender.mock.calls.length;

    act(() => {
      store.dispatch({ type: "annet/oek" });
    });

    expect(onRender).toHaveBeenCalledTimes(antallRendringer);
  });
});
