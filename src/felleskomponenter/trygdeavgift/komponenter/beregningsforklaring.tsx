import { Beregningstype } from "../../../services/modules/trygdeavgift";

import "./trygdeavgiftsperioderTabell.less";

interface MedBeregningstype {
  beregningstype?: Beregningstype | null;
  avgiftssats: number | null;
}

const BEREGNINGSTYPE_FORKLARINGER = {
  TJUEFEM_PROSENT_REGEL: {
    symbol: "*",
    tekst: "Beregnet etter 25 %-regelen: Trygdeavgift skal ikke utgjøre mer enn 25 % av inntekt over minstebeløpet.",
  },
  MINSTEBELOEP: { symbol: "**", tekst: "Inntekten er under minstebeløpet." },
} as const;

export function formaterSats(periode: MedBeregningstype): string {
  switch (periode.beregningstype) {
    case "TJUEFEM_PROSENT_REGEL":
      return "*";
    case "MINSTEBELOEP":
      return "**";
    default:
      return periode.avgiftssats?.toString() ?? "";
  }
}

export function erOrdinaerBeregning(beregningstype?: Beregningstype | null): boolean {
  return !beregningstype || beregningstype === "ORDINAER";
}

export function Beregningsforklaringer({ perioder }: { perioder: MedBeregningstype[] }) {
  const typer = new Set(perioder.map((p) => p.beregningstype).filter(Boolean));

  const aktuelleForklaringer = Object.entries(BEREGNINGSTYPE_FORKLARINGER).filter(([type]) =>
    typer.has(type as Beregningstype),
  );

  if (aktuelleForklaringer.length === 0) return null;

  return (
    <div className="forklaringstekster">
      {aktuelleForklaringer.map(([type, { symbol, tekst }]) => (
        <p key={type}>
          {symbol} {tekst}
        </p>
      ))}
    </div>
  );
}
