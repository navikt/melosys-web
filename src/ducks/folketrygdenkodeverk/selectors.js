import { createSelector } from 'reselect';

export const FolketrygdenkodeverkSelector = createSelector(
  state => (state.folketrygdenkodeverk.data ? state.folketrygdenkodeverk.data : {}),
  folketrygdenkodeverk => folketrygdenkodeverk
);

export const TrygdedekningerSelector = createSelector(
  FolketrygdenkodeverkSelector,
  folketrygdenkodeverk => folketrygdenkodeverk.trygdedekninger ? folketrygdenkodeverk.trygdedekninger : []
);
