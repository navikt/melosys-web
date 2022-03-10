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

export const TrygdedekningerSelector = createSelector(FolketrygdenkodeverkDataSelector, (folketrygdenkodeverk) =>
  folketrygdenkodeverk.Trygdedekninger ? folketrygdenkodeverk.Trygdedekninger : []
);

export const VilkaarSelector = createSelector(FolketrygdenkodeverkDataSelector, (folketrygdenkodeverk) =>
  folketrygdenkodeverk.Vilkaar ? folketrygdenkodeverk.Vilkaar : []
);

export const BegrunnelserSelector = createSelector(FolketrygdenkodeverkDataSelector, (folketrygdenkodeverk) =>
  folketrygdenkodeverk.begrunnelser ? folketrygdenkodeverk.begrunnelser : {}
);

export const Medfolgende_barn_begrunnelser_ftrlBegrunnelserSelector = createSelector(
  BegrunnelserSelector,
  (begrunnelser) => begrunnelser.Medfolgende_barn_begrunnelser_ftrl
);

export const Medfolgende_ektefelle_samboer_begrunnelser_ftrlBegrunnelserSelector = createSelector(
  BegrunnelserSelector,
  (begrunnelser) => begrunnelser.Medfolgende_ektefelle_samboer_begrunnelser_ftrl
);

export const InnvilgelsesResultatSelector = createSelector(FolketrygdenkodeverkDataSelector, (folketrygdenkodeverk) =>
  folketrygdenkodeverk.InnvilgelsesResultat ? folketrygdenkodeverk.InnvilgelsesResultat : []
);
export const SaerligeavgiftsgrupperSelector = createSelector(FolketrygdenkodeverkDataSelector, (folketrygdenkodeverk) =>
  folketrygdenkodeverk.Saerligeavgiftsgrupper ? folketrygdenkodeverk.Saerligeavgiftsgrupper : []
);
