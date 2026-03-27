import { Beregningsregel } from "../../../services/modules/trygdeavgift";

import "./beregningsforklaring.less";

interface MedBeregningsregel {
  beregningsregel?: Beregningsregel | null;
  avgiftssats: number | null;
  harSammenslåtteInntektskilder?: boolean;
}

const BEREGNINGSREGEL_FORKLARINGER: Partial<Record<Beregningsregel, { symbol: string; tekst: string }>> = {
  TJUEFEM_PROSENT_REGEL: {
    symbol: "*",
    tekst: "Beregnet etter 25 %-regelen: Trygdeavgift skal ikke utgjøre mer enn 25 % av inntekt over minstebeløpet.",
  },
  MINSTEBELØP: { symbol: "**", tekst: "Inntekten er under minstebeløpet." },
};

export function formaterSats(periode: MedBeregningsregel): string {
  const forklaring = periode.beregningsregel ? BEREGNINGSREGEL_FORKLARINGER[periode.beregningsregel] : undefined;
  if (forklaring) return forklaring.symbol;
  return periode.avgiftssats?.toString() ?? "";
}

export function erOrdinaerBeregning(beregningsregel?: Beregningsregel | null): boolean {
  return !beregningsregel || beregningsregel === "ORDINÆR";
}

const AVGIFTSDEL_TEKST: Record<string, string> = {
  HELSE: "Helsedel",
  PENSJON: "Pensjonsdel",
};

export function formaterDekning(
  periode: { avgiftsdel?: string | null; trygdedekning: string },
  finnTerm: (kode: string) => string,
): string {
  if (periode.avgiftsdel && AVGIFTSDEL_TEKST[periode.avgiftsdel]) {
    return AVGIFTSDEL_TEKST[periode.avgiftsdel];
  }
  return finnTerm(periode.trygdedekning);
}

export function formaterInntektskilde(
  periode: { harSammenslåtteInntektskilder?: boolean; inntektskildetype: string },
  finnTerm: (kode: string) => string,
): string {
  if (periode.harSammenslåtteInntektskilder) return "***";
  return finnTerm(periode.inntektskildetype);
}

export function Beregningsforklaringer({ perioder }: { perioder: MedBeregningsregel[] }) {
  const typer = new Set(perioder.map((p) => p.beregningsregel).filter(Boolean));
  const harSammenslåtte = perioder.some((p) => p.harSammenslåtteInntektskilder);

  const aktuelleForklaringer = (Object.keys(BEREGNINGSREGEL_FORKLARINGER) as Beregningsregel[])
    .filter((type) => typer.has(type))
    .map((type) => BEREGNINGSREGEL_FORKLARINGER[type]!);

  if (aktuelleForklaringer.length === 0 && !harSammenslåtte) return null;

  return (
    <div className="forklaringstekster">
      {aktuelleForklaringer.map(({ symbol, tekst }) => (
        <p key={symbol}>
          {symbol} {tekst}
        </p>
      ))}
      {harSammenslåtte && <p key="sammenslatt">*** Mer enn en inntektskilde</p>}
    </div>
  );
}
