/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

// selector(s)
export const VilkarSelector = createSelector(
  state => (state.vilkar.data ? state.vilkar.data : []),
  vurdering => vurdering
);

export const vesentligVirksomhetSelector = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === 'VESENTLIG_VIRKSOMHET') || {})
);

export const forutgaendeMedlemskap = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === 'FORUTGAAENDE_MEDLEMSKAP') || {})
);
