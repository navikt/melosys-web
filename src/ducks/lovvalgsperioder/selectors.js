/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

// import * as Koder from '../../kodeverk';

// selector(s)
export const LovvalgsperioderSelector = createSelector(
  state => (state.lovvalgsperioder.data ? state.lovvalgsperioder.data : []),
  lovvalgsperioder => lovvalgsperioder
);

export const LovvalgsperiodeSelector = createSelector(
  state => LovvalgsperioderSelector(state),
  lovvalgsPerioder => (lovvalgsPerioder[0] ? lovvalgsPerioder[0] : {})
);
