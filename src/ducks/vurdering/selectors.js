/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const VurderingStatusSelector = createSelector(
  state => (state.vurdering.status ? state.vurdering.status : ''),
  vurderingStatus => vurderingStatus || ''
);

// selector(s)
export const VurderingSelector = createSelector(
  state => (state.vurdering.data.vurdering ? state.vurdering.data.vurdering : {}),
  vurdering => vurdering
);

export const VurderingLovvalgbestemmelserSelector = createSelector(
  state => (state.vurdering.data.vurdering ? state.vurdering.data.vurdering.lovvalgsbestemmelser : []),
  lovvalgsbestemmelser => lovvalgsbestemmelser
);

export const VurderingFeilmeldingSelector = createSelector(
  state => (state.vurdering.data.vurdering ? state.vurdering.data.vurdering.feilmeldinger : []),
  feilmeldinger => feilmeldinger
);
