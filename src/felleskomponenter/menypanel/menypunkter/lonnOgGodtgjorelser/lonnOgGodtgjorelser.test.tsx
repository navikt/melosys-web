import { BooleanFeltRedigeringUtfort, InntektRedigeringUtfortUndertittel } from "./lonnOgGodtgjorelser";
import { render, screen } from "@testing-library/react";
import { expect } from "vitest";

describe("LonnOgGodtgjorelser", () => {
  describe("BooleanFeltRedigeringUtfort", () => {
    const props = (verdi: boolean | null) => ({ verdi, tekst: "heihei" });

    it('viser "Ja" dersom verdi er true', () => {
      render(<BooleanFeltRedigeringUtfort {...props(true)} />);
      expect(screen.getByText("Ja")).toBeInTheDocument();
    });

    it('viser "Nei" dersom verdi er false', () => {
      render(<BooleanFeltRedigeringUtfort {...props(false)} />);
      expect(screen.getByText("Nei")).toBeInTheDocument();
    });

    it('viser "-" dersom verdi er null', () => {
      render(<BooleanFeltRedigeringUtfort {...props(null)} />);
      expect(screen.getByText("-")).toBeInTheDocument();
      expect(screen.getByText("heihei")).toBeInTheDocument();
    });
  });

  describe("InntektRedigeringUtfortUndertittel", () => {
    it('viser "-" dersom verdi er tom streng', () => {
      render(<InntektRedigeringUtfortUndertittel verdi="" />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it('viser "-" dersom verdi er null', () => {
      render(<InntektRedigeringUtfortUndertittel verdi={null} />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("viser formatert inntekt dersom verdi er 123", () => {
      render(<InntektRedigeringUtfortUndertittel verdi={123} />);
      expect(screen.getByText("123,00")).toBeInTheDocument();
    });
  });
});
