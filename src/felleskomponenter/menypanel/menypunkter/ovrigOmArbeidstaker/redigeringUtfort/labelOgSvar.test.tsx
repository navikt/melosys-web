import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JaNeiSvar, LabelOgSvar } from "./labelOgSvar";

describe("JaNeiSvar", () => {
  it("viser Ja for true", () => {
    render(<JaNeiSvar svar={true} />);
    expect(screen.getByText("Ja")).toBeInTheDocument();
  });

  it("viser Nei for false", () => {
    render(<JaNeiSvar svar={false} />);
    expect(screen.getByText("Nei")).toBeInTheDocument();
  });

  it("viser bindestrek for null", () => {
    render(<JaNeiSvar svar={null} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("viser bindestrek for undefined", () => {
    render(<JaNeiSvar svar={undefined} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});

describe("LabelOgSvar", () => {
  it("rendrer label og svar", () => {
    render(<LabelOgSvar label="Spørsmål" svar={<span>Svar</span>} />);
    expect(screen.getByText("Spørsmål")).toBeInTheDocument();
    expect(screen.getByText("Svar")).toBeInTheDocument();
  });
});
