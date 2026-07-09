import { createContext, useContext } from "react";
import { Beregningsinntektsgruppe } from "../../../services/modules/trygdeavgift";

/**
 * Lar tabellen og fotnotene be om at beregningsforklaring-kortet åpner seg og
 * scroller til riktig felt (matchet på år + inntektsgruppe). Når toggelen er av
 * eller det ikke finnes forklaringer, er verdien `undefined` og `*`/`**` vises
 * som ren tekst (uendret oppførsel).
 */
export type ÅpneGrunnlagFn = (aar: number, inntektsgruppe: Beregningsinntektsgruppe) => void;

const BeregningsforklaringKortContext = createContext<ÅpneGrunnlagFn | undefined>(undefined);

export const BeregningsforklaringKortProvider = BeregningsforklaringKortContext.Provider;

export function useÅpneGrunnlag(): ÅpneGrunnlagFn | undefined {
  return useContext(BeregningsforklaringKortContext);
}

export function feltId(aar: number, inntektsgruppe: Beregningsinntektsgruppe): string {
  return `beregningsforklaring-kort-${aar}-${inntektsgruppe}`;
}
