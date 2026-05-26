import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

type PensjonsopptjeningState = StateSection<Types.PensjonsopptjeningRespons | Record<string, never>>;

export const PensjonsopptjeningSelector: Selector<RootState, PensjonsopptjeningState> = createSelector(
  (state: RootState) => state.pensjonsopptjening as PensjonsopptjeningState,
  (pensjonsopptjening) => pensjonsopptjening,
);

export const PensjonsopptjeningPerioderSelector: Selector<RootState, Types.PensjonsopptjeningPeriode[]> =
  createSelector(PensjonsopptjeningSelector, (state) => {
    const data = state.data as Types.PensjonsopptjeningRespons;
    return data && Array.isArray(data.perioder) ? data.perioder : [];
  });
