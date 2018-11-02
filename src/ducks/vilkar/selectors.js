/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

import { KodeverkSelectors } from '../kodeverk';

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
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === 'ART12_1_FORUTGAAENDE_MEDLEMSKAP') || {})
);

export const bosattINorge = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === 'BOSATT_I_NORGE') || {})
);

export const art12_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === 'ART12_1') || {})
);

export const art16_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === 'ART16_1') || {})
);

export const valgteLovvalgsVilkar = createSelector(
  state => VilkarSelector(state),
  state => KodeverkSelectors.alleLovvalgSelector(state),
  (vilkar, alleLovvalg) => (
    vilkar.filter(enkeltVilkar => alleLovvalg.find(enkeltLovvalg => enkeltLovvalg.kode === enkeltVilkar.vilkaar))
  )
);
