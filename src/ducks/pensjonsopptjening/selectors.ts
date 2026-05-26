import { createSelector, Selector } from "reselect";
import { RootState } from "AppTypes";
import { STATUS } from "../../services";
import * as Types from "./types";

export const PensjonsopptjeningSelector: Selector<RootState, RootState["pensjonsopptjening"]> = (state) =>
  state.pensjonsopptjening;

export const PensjonsopptjeningPerioderSelector: Selector<RootState, Types.PensjonsopptjeningPeriode[]> =
  createSelector(PensjonsopptjeningSelector, (state) => {
    if (state.status !== STATUS.OK) return [];
    const data = state.data as Types.PensjonsopptjeningRespons;
    return Array.isArray(data?.perioder) ? data.perioder : [];
  });
