import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PanelHeader from "./panelHeader";

describe("PanelHeader", () => {
  it("rendrer tittel", () => {
    render(<PanelHeader tittel="Min tittel" />);
    expect(screen.getByText("Min tittel")).toBeInTheDocument();
  });

  it("rendrer undertittel når oppgitt", () => {
    render(<PanelHeader tittel="Tittel" undertittel="Undertittel" />);
    expect(screen.getByText("Undertittel")).toBeInTheDocument();
  });

  it("rendrer ikon når oppgitt", () => {
    const TestIkon = ({ className }: { className?: string }) => <svg data-testid="test-ikon" className={className} />;
    render(<PanelHeader tittel="Tittel" ikon={TestIkon} />);
    expect(screen.getByTestId("test-ikon")).toBeInTheDocument();
  });

  it("rendrer uten ikon når ikke oppgitt", () => {
    const { container } = render(<PanelHeader tittel="Tittel" />);
    expect(container.querySelector(".panelheader__ikon")).not.toBeInTheDocument();
  });
});
