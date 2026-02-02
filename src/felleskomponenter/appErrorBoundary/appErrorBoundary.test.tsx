import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppErrorBoundary from "./appErrorBoundary";

const ThrowingComponent = () => {
  throw new Error("Test error");
};

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rendrer barn normalt uten feil", () => {
    render(
      <AppErrorBoundary>
        <div>Alt OK</div>
      </AppErrorBoundary>,
    );
    expect(screen.getByText("Alt OK")).toBeInTheDocument();
  });

  it("viser feilmelding når barn kaster error", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent />
      </AppErrorBoundary>,
    );
    expect(screen.getByText("Noe gikk galt")).toBeInTheDocument();
    expect(screen.getByText("Beklager, kunne ikke laste inn siden.")).toBeInTheDocument();
  });

  it("viser Prøv igjen-knapp ved feil", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent />
      </AppErrorBoundary>,
    );
    expect(screen.getByText("Prøv igjen")).toBeInTheDocument();
  });

  it("Prøv igjen-knapp kan klikkes uten å crashe", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent />
      </AppErrorBoundary>,
    );
    expect(screen.getByText("Noe gikk galt")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Prøv igjen"));
  });
});
