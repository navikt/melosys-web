import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FraRegister, FraBruker, BrukersDel, ArbeidstakersDel, ArbeidsgiversDel, Under18Aar } from "./tags";

describe("Tags", () => {
  it("FraRegister rendrer med riktig tekst", () => {
    render(<FraRegister />);
    expect(screen.getByText("Fra register")).toBeInTheDocument();
  });

  it("FraBruker rendrer med riktig tekst", () => {
    render(<FraBruker />);
    expect(screen.getByText("Fra bruker")).toBeInTheDocument();
  });

  it("BrukersDel rendrer med riktig tekst", () => {
    render(<BrukersDel />);
    expect(screen.getByText("Brukers del")).toBeInTheDocument();
  });

  it("ArbeidstakersDel rendrer med riktig tekst", () => {
    render(<ArbeidstakersDel />);
    expect(screen.getByText("Arbeidstakers del")).toBeInTheDocument();
  });

  it("ArbeidsgiversDel rendrer med riktig tekst", () => {
    render(<ArbeidsgiversDel />);
    expect(screen.getByText("Arbeidsgivers del")).toBeInTheDocument();
  });

  it("Under18Aar rendrer med riktig tekst", () => {
    render(<Under18Aar />);
    expect(screen.getByText("Under 18 år")).toBeInTheDocument();
  });
});
