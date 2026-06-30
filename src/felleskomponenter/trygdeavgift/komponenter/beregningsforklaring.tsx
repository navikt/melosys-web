import { Beregningsforklaring, Beregningsregel, Beregningsregelgruppe } from "../../../services/modules/trygdeavgift";
import { feltId, useÅpneGrunnlag, ÅpneGrunnlagFn } from "./beregningsforklaringKortContext";

import "./beregningsforklaring.less";

interface MedBeregningsregel {
  beregningsregel?: Beregningsregel | null;
  avgiftssats: number | null;
  harSammenslåtteInntektskilder?: boolean;
  avgiftsdel?: string | null;
  fom?: string;
}

interface Beregningsregelforklaring {
  symbol: string;
  tekst: string;
  alertTekst?: string;
}

const BEREGNINGSREGEL_FORKLARINGER: Partial<Record<Beregningsregel, Beregningsregelforklaring>> = {
  TJUEFEM_PROSENT_REGEL: {
    symbol: "*",
    tekst: "Beregnet etter 25 %-regelen",
  },
  MINSTEBELØP: {
    symbol: "**",
    tekst: "Inntekten er under minstebeløpet",
    alertTekst: "Trygdeavgift skal ikke betales da inntekten er under minstebeløpet.",
  },
};

const AVGIFTSDEL_TIL_REGELGRUPPE: Record<string, Beregningsregelgruppe> = {
  HELSE: "HELSEDEL",
  PENSJON: "PENSJONSDEL",
};

export function erUnderMinstebeløp(periode: { beregningsregel?: Beregningsregel | null }): boolean {
  return periode.beregningsregel === "MINSTEBELØP";
}

export const MINSTEBELØP_ALERT_TEKST = BEREGNINGSREGEL_FORKLARINGER.MINSTEBELØP!.alertTekst!;

/**
 * Finner forklaringsfeltet som hører til en tabellperiode. Matcher på året (utledet fra
 * `fom`) når det er tilgjengelig, deretter regelgruppe utledet fra `avgiftsdel`, ellers på
 * valgt regel (`*`=25 %, `**`=minstebeløp). Året skiller forklaringer når API-et returnerer
 * flere år, slik at `*`/`**` åpner riktig felt (felt-id bygges på år+regelgruppe).
 */
export function finnForklaringForPeriode(
  forklaringer: Beregningsforklaring[] | undefined,
  periode: MedBeregningsregel,
): Beregningsforklaring | undefined {
  if (!forklaringer || forklaringer.length === 0 || !periode.beregningsregel) return undefined;

  const ønsketGruppe = periode.avgiftsdel ? AVGIFTSDEL_TIL_REGELGRUPPE[periode.avgiftsdel] : undefined;
  const periodeAar = periode.fom ? Number(periode.fom.slice(0, 4)) : undefined;
  const harÅr = periodeAar !== undefined && !Number.isNaN(periodeAar);

  const matcherRegelOgÅr = (f: Beregningsforklaring) =>
    f.valgtRegel === periode.beregningsregel && (!harÅr || f.aar === periodeAar);

  if (ønsketGruppe) {
    const påGruppe = forklaringer.find((f) => f.regelgruppe === ønsketGruppe && matcherRegelOgÅr(f));
    if (påGruppe) return påGruppe;
  }
  return forklaringer.find(matcherRegelOgÅr);
}

function SatsSymbol({
  symbol,
  forklaring,
  åpneGrunnlag,
}: {
  symbol: string;
  forklaring: Beregningsforklaring | undefined;
  åpneGrunnlag: ÅpneGrunnlagFn | undefined;
}) {
  if (!åpneGrunnlag || !forklaring) return <>{symbol}</>;
  return (
    <button
      type="button"
      className="beregningsforklaring-symbol"
      title="Hvorfor? Klikk for beregningsforklaring"
      onClick={() => åpneGrunnlag(forklaring.aar, forklaring.regelgruppe)}
    >
      {symbol}
    </button>
  );
}

export function formaterSats(periode: MedBeregningsregel): string {
  const forklaring = periode.beregningsregel ? BEREGNINGSREGEL_FORKLARINGER[periode.beregningsregel] : undefined;
  if (forklaring) return forklaring.symbol;
  return periode.avgiftssats?.toString() ?? "";
}

/**
 * Som `formaterSats`, men returnerer en klikkbar `*`/`**` når en beregningsforklaring
 * finnes (toggle på). Faller tilbake til ren tekst ellers.
 */
export function FormaterSats({
  periode,
  forklaringer,
}: {
  periode: MedBeregningsregel;
  forklaringer?: Beregningsforklaring[];
}) {
  const åpneGrunnlag = useÅpneGrunnlag();
  const regelforklaring = periode.beregningsregel ? BEREGNINGSREGEL_FORKLARINGER[periode.beregningsregel] : undefined;
  if (!regelforklaring) return <>{periode.avgiftssats?.toString() ?? ""}</>;

  const forklaring = finnForklaringForPeriode(forklaringer, periode);
  return <SatsSymbol symbol={regelforklaring.symbol} forklaring={forklaring} åpneGrunnlag={åpneGrunnlag} />;
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

function HvorforLenke({
  beregningsregel,
  perioder,
  forklaringer,
}: {
  beregningsregel: Beregningsregel;
  perioder: MedBeregningsregel[];
  forklaringer?: Beregningsforklaring[];
}) {
  const åpneGrunnlag = useÅpneGrunnlag();
  if (!åpneGrunnlag || !forklaringer || forklaringer.length === 0) return null;

  const periode = perioder.find((p) => p.beregningsregel === beregningsregel);
  const forklaring = periode && finnForklaringForPeriode(forklaringer, periode);
  if (!forklaring) return null;

  return (
    <button
      type="button"
      className="beregningsforklaring-hvorfor"
      onClick={() => åpneGrunnlag(forklaring.aar, forklaring.regelgruppe)}
    >
      Hvorfor? →
    </button>
  );
}

export function Beregningsforklaringer({
  perioder,
  forklaringer,
}: {
  perioder: MedBeregningsregel[];
  forklaringer?: Beregningsforklaring[];
}) {
  const typer = new Set(perioder.map((p) => p.beregningsregel).filter(Boolean));
  const harSammenslåtte = perioder.some((p) => p.harSammenslåtteInntektskilder);

  const aktuelleRegler = (Object.keys(BEREGNINGSREGEL_FORKLARINGER) as Beregningsregel[]).filter((type) =>
    typer.has(type),
  );

  if (aktuelleRegler.length === 0 && !harSammenslåtte) return null;

  return (
    <div className="forklaringstekster">
      {aktuelleRegler.map((regel) => {
        const { symbol, tekst } = BEREGNINGSREGEL_FORKLARINGER[regel]!;
        return (
          <p key={symbol}>
            {symbol} {tekst} <HvorforLenke beregningsregel={regel} perioder={perioder} forklaringer={forklaringer} />
          </p>
        );
      })}
      {harSammenslåtte && <p key="sammenslatt">*** Mer enn en inntekt</p>}
    </div>
  );
}

export { feltId };
