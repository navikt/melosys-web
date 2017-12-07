import { createSelector } from 'reselect';

// eslint-disable-next-line
export const SoknadenFormSelector = createSelector(
  state => (state.form.soknad ? state.form.soknad : {}),
  soknaden => soknaden
);
