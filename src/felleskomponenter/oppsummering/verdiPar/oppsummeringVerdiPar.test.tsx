import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OppsummeringVerdiPar from "./oppsummeringVerdiPar";

describe("OppsummeringVerdiPar", () => {
  it("rendrer nøkkel og verdi", () => {
    render(<OppsummeringVerdiPar nokkel="Navn" verdi="Ola Nordmann" />);
    expect(screen.getByText("Navn:")).toBeInTheDocument();
    expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
  });

  it("rendrer tom nøkkel uten kolon", () => {
    render(<OppsummeringVerdiPar nokkel="" verdi="Verdi" />);
    expect(screen.getByText("Verdi")).toBeInTheDocument();
  });

  it("rendrer ekstrafelt når oppgitt", () => {
    render(<OppsummeringVerdiPar nokkel="Felt" verdi="Verdi" ekstrafelt={<span data-testid="ekstra">Ekstra</span>} />);
    expect(screen.getByTestId("ekstra")).toBeInTheDocument();
  });

  it("bruker custom className", () => {
    const { container } = render(<OppsummeringVerdiPar nokkel="Felt" verdi="Verdi" className="custom" />);
    expect(container.querySelector(".custom")).toBeInTheDocument();
  });
});
