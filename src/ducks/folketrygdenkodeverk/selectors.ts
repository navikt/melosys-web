import { createSelector, Selector } from "reselect";
import { RootState, StateSection } from "AppTypes";
import * as Types from "./types";

export const FolketrygdenkodeverkSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  (state: RootState) => state.folketrygdenkodeverk,
  (folketrygdenkodeverk) => folketrygdenkodeverk
);

export const FolketrygdenkodeverkDataSelector: Selector<RootState, Types.Data> = createSelector(
  FolketrygdenkodeverkSelector,
  (folketrygdenkodeverk) => (folketrygdenkodeverk.data ? folketrygdenkodeverk.data : {})
);

export const BegrunnelserSelector = createSelector(FolketrygdenkodeverkDataSelector, (folketrygdenkodeverk) =>
  folketrygdenkodeverk.begrunnelser ? folketrygdenkodeverk.begrunnelser : {}
);
