import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  erOrdinaerBeregning,
  formaterDekning,
  formaterInntektskilde,
  formaterSats,
  Beregningsforklaringer,
} from "./beregningsforklaring";

describe("formaterSats", () => {
  it("viser '*' for TJUEFEM_PROSENT_REGEL", () => {
    expect(formaterSats({ beregningsregel: "TJUEFEM_PROSENT_REGEL", avgiftssats: 8.2 })).toBe("*");
  });

  it("viser '**' for MINSTEBELØP", () => {
    expect(formaterSats({ beregningsregel: "MINSTEBELØP", avgiftssats: 0 })).toBe("**");
  });

  it("viser sats som streng for null beregningsregel", () => {
    expect(formaterSats({ beregningsregel: null, avgiftssats: 8.2 })).toBe("8.2");
  });

  it("viser sats som streng for ORDINÆR", () => {
    expect(formaterSats({ beregningsregel: "ORDINÆR", avgiftssats: 8.2 })).toBe("8.2");
  });

  it("viser tom streng når sats er null og ingen spesiell beregningsregel", () => {
    expect(formaterSats({ beregningsregel: null, avgiftssats: null })).toBe("");
  });
});

describe("erOrdinaerBeregning", () => {
  it("returnerer true for undefined", () => {
    expect(erOrdinaerBeregning(undefined)).toBe(true);
  });

  it("returnerer true for null", () => {
    expect(erOrdinaerBeregning(null)).toBe(true);
  });

  it("returnerer true for ORDINÆR", () => {
    expect(erOrdinaerBeregning("ORDINÆR")).toBe(true);
  });

  it("returnerer false for TJUEFEM_PROSENT_REGEL", () => {
    expect(erOrdinaerBeregning("TJUEFEM_PROSENT_REGEL")).toBe(false);
  });

  it("returnerer false for MINSTEBELØP", () => {
    expect(erOrdinaerBeregning("MINSTEBELØP")).toBe(false);
  });
});

describe("formaterDekning", () => {
  const finnTerm = vi.fn((kode: string) => `Term(${kode})`);

  it("viser 'Helsedel' for avgiftsdel HELSE", () => {
    expect(formaterDekning({ avgiftsdel: "HELSE", trygdedekning: "FULL" }, finnTerm)).toBe("Helsedel");
  });

  it("viser 'Pensjonsdel' for avgiftsdel PENSJON", () => {
    expect(formaterDekning({ avgiftsdel: "PENSJON", trygdedekning: "FULL" }, finnTerm)).toBe("Pensjonsdel");
  });

  it("bruker kodeverk-term når avgiftsdel er null", () => {
    expect(formaterDekning({ avgiftsdel: null, trygdedekning: "FULL" }, finnTerm)).toBe("Term(FULL)");
  });

  it("bruker kodeverk-term når avgiftsdel er undefined", () => {
    expect(formaterDekning({ avgiftsdel: undefined, trygdedekning: "FULL" }, finnTerm)).toBe("Term(FULL)");
  });
});

describe("formaterInntektskilde", () => {
  const finnTerm = vi.fn((kode: string) => `Term(${kode})`);

  it("viser '***' når harSammenslåtteInntektskilder er true", () => {
    expect(formaterInntektskilde({ harSammenslåtteInntektskilder: true, inntektskildetype: "ARBEID" }, finnTerm)).toBe(
      "***",
    );
  });

  it("bruker kodeverk-term når harSammenslåtteInntektskilder er false", () => {
    expect(formaterInntektskilde({ harSammenslåtteInntektskilder: false, inntektskildetype: "ARBEID" }, finnTerm)).toBe(
      "Term(ARBEID)",
    );
  });

  it("bruker kodeverk-term når harSammenslåtteInntektskilder er undefined", () => {
    expect(
      formaterInntektskilde({ harSammenslåtteInntektskilder: undefined, inntektskildetype: "ARBEID" }, finnTerm),
    ).toBe("Term(ARBEID)");
  });
});

describe("Beregningsforklaringer", () => {
  it("rendrer ingenting ved ordinær beregning", () => {
    const { container } = render(
      <Beregningsforklaringer
        perioder={[{ beregningsregel: null, avgiftssats: 8.2, harSammenslåtteInntektskilder: false }]}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("viser fotnote for 25 %-regelen", () => {
    render(<Beregningsforklaringer perioder={[{ beregningsregel: "TJUEFEM_PROSENT_REGEL", avgiftssats: 0 }]} />);
    expect(screen.getByText(/Beregnet etter 25 %-regelen/)).toBeInTheDocument();
  });

  it("viser fotnote for inntekt under minstebeløpet", () => {
    render(<Beregningsforklaringer perioder={[{ beregningsregel: "MINSTEBELØP", avgiftssats: 0 }]} />);
    expect(screen.getByText(/Inntekten er under minstebeløpet/)).toBeInTheDocument();
  });

  it("viser fotnote for sammenslåtte inntektskilder", () => {
    render(
      <Beregningsforklaringer
        perioder={[{ beregningsregel: null, avgiftssats: 8.2, harSammenslåtteInntektskilder: true }]}
      />,
    );
    expect(screen.getByText(/Mer enn en inntekt/)).toBeInTheDocument();
  });

  it("viser alle forklaringer ved kombinasjon av regler og sammenslåtte inntektskilder", () => {
    render(
      <Beregningsforklaringer
        perioder={[
          { beregningsregel: "TJUEFEM_PROSENT_REGEL", avgiftssats: 0, harSammenslåtteInntektskilder: false },
          { beregningsregel: "MINSTEBELØP", avgiftssats: 0, harSammenslåtteInntektskilder: true },
        ]}
      />,
    );
    expect(screen.getByText(/Beregnet etter 25 %-regelen/)).toBeInTheDocument();
    expect(screen.getByText(/Inntekten er under minstebeløpet/)).toBeInTheDocument();
    expect(screen.getByText(/Mer enn en inntekt/)).toBeInTheDocument();
  });

  it("viser ikke duplikat fotnote for samme beregningsregel i flere perioder", () => {
    render(
      <Beregningsforklaringer
        perioder={[
          { beregningsregel: "TJUEFEM_PROSENT_REGEL", avgiftssats: 0 },
          { beregningsregel: "TJUEFEM_PROSENT_REGEL", avgiftssats: 0 },
        ]}
      />,
    );
    expect(screen.getAllByText(/Beregnet etter 25 %-regelen/)).toHaveLength(1);
  });
});
