import { Beregningstype } from "../../../services/modules/trygdeavgift";

import "./trygdeavgiftsperioderTabell.less";

interface MedBeregningstype {
  beregningstype?: Beregningstype | null;
  avgiftssats: number | null;
}

const BEREGNINGSTYPE_FORKLARINGER = {
  MINSTEBELOEP: { symbol: "*", tekst: "Inntekten er lavere enn minstebeløpet for trygdeavgift." },
  TJUEFEM_PROSENT_REGEL: {
    symbol: "**",
    tekst: "Trygdeavgiften kan maks utgjøre 25 % av inntekten som overstiger minstebeløpet.",
  },
} as const;

export function formaterSats(periode: MedBeregningstype): string {
  const forklaring =
    periode.beregningstype &&
    BEREGNINGSTYPE_FORKLARINGER[periode.beregningstype as keyof typeof BEREGNINGSTYPE_FORKLARINGER];
  if (forklaring) return forklaring.symbol;
  return periode.avgiftssats?.toString() ?? "";
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
