import { Beregningstype } from "../../../services/modules/trygdeavgift";

import "./beregningsforklaring.less";

interface MedBeregningstype {
  beregningstype?: Beregningstype | null;
  avgiftssats: number | null;
}

const BEREGNINGSTYPE_FORKLARINGER: Partial<Record<Beregningstype, { symbol: string; tekst: string }>> = {
  TJUEFEM_PROSENT_REGEL: {
    symbol: "*",
    tekst: "Beregnet etter 25 %-regelen: Trygdeavgift skal ikke utgjøre mer enn 25 % av inntekt over minstebeløpet.",
  },
  MINSTEBELOEP: { symbol: "**", tekst: "Inntekten er under minstebeløpet." },
};

export function formaterSats(periode: MedBeregningstype): string {
  const forklaring = periode.beregningstype ? BEREGNINGSTYPE_FORKLARINGER[periode.beregningstype] : undefined;
  if (forklaring) return forklaring.symbol;
  return periode.avgiftssats?.toString() ?? "";
}

export function erOrdinaerBeregning(beregningstype?: Beregningstype | null): boolean {
  return !beregningstype || beregningstype === "ORDINAER";
}

export function Beregningsforklaringer({ perioder }: { perioder: MedBeregningstype[] }) {
  const typer = new Set(perioder.map((p) => p.beregningstype).filter(Boolean));

  const aktuelleForklaringer = (Object.keys(BEREGNINGSTYPE_FORKLARINGER) as Beregningstype[])
    .filter((type) => typer.has(type))
    .map((type) => BEREGNINGSTYPE_FORKLARINGER[type]!);

  if (aktuelleForklaringer.length === 0) return null;

  return (
    <div className="forklaringstekster">
      {aktuelleForklaringer.map(({ symbol, tekst }) => (
        <p key={symbol}>
          {symbol} {tekst}
        </p>
      ))}
    </div>
  );
}
