/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

import { KodeverkSelectors } from '../kodeverk';

import * as Koder from '../../koder';

// selector(s)
export const VilkarSelector = createSelector(
  state => (state.vilkar.data ? state.vilkar.data : []),
  vurdering => vurdering
);

export const vesentligVirksomhetSelector = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === Koder.VESENTLIG_VIRKSOMHET) || {})
);

export const forutgaendeMedlemskap = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === Koder.ART12_1_FORUTGAAENDE_MEDLEMSKAP) || {})
);

export const bosattINorge = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === Koder.BOSATT_I_NORGE) || {})
);

export const art12_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === Koder.FO_883_2004_ART12_1) || {})
);

export const art12_2 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === Koder.FO_883_2004_ART12_2) || {})
);

export const art16_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === Koder.FO_883_2004_ART16_1) || {})
);

export const valgteLovvalgsVilkar = createSelector(
  state => VilkarSelector(state),
  state => KodeverkSelectors.alleLovvalgSelector(state),
  (vilkar, alleLovvalg) => (
    vilkar.filter(enkeltVilkar => alleLovvalg.find(enkeltLovvalg => enkeltLovvalg.kode === enkeltVilkar.vilkaar))
  )
);
