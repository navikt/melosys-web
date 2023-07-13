import { RootState, StateSection } from "AppTypes";
import { createSelector, Selector } from "reselect";
import * as Types from "./types";

export const MedlemskapsperioderSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.medlemskapsperioder,
  (medlemskapsperioder) => medlemskapsperioder
);

export const MedlemskapsperioderStatusSelector: Selector<RootState, string> = createSelector(
  MedlemskapsperioderSelector,
  (medlemskapsperioder) => medlemskapsperioder.status
);

export const MedlemskapsperioderDataSelector: Selector<RootState, Types.Data> = createSelector(
  MedlemskapsperioderSelector,
  (medlemskapsperioder) => medlemskapsperioder.data
);

export const AlleMedlemskapsperioderSelector = createSelector(
  MedlemskapsperioderDataSelector,
  (medlemskapsperioder) => medlemskapsperioder.medlemskapsperioder
);

export const BestemmelseSelector = createSelector(MedlemskapsperioderDataSelector, (medlemskapsperioderData) =>
  medlemskapsperioderData.bestemmelse ? medlemskapsperioderData.bestemmelse : ""
);
