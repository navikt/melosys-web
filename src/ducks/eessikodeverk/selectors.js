/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const kodemapsSelector = createSelector(
  state => state.eessikodeverk.data.kodemaps,
  kodemaps => kodemaps
);

export const sektor2bucSelector = createSelector(
  state => kodemapsSelector(state),
  kodemaps => kodemaps.SEKTOR2BUC
);

export const sektorSelector = createSelector(
  state => state.eessikodeverk.data.sektor,
  sektor => sektor
);

export const alleSEDtyperSelector = createSelector(
  state => state.eessikodeverk.data.sedtyper,
  sedtyper => sedtyper
);

export const alleBUCtyperSelector = createSelector(
  state => state.eessikodeverk.data.buctyper,
  buctyper => buctyper
);
