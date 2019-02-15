/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import * as MKV from 'melosys-kodeverk';

// selector(s)
export const VilkarSelector = createSelector(
  state => (state.vilkar.data ? state.vilkar.data : []),
  vurdering => vurdering
);

export const vesentligVirksomhetSelector = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.ART12_1_VESENTLIG_VIRKSOMHET) || {})
);

export const normaltDriverVirksomhetSelector = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.ART12_2_NORMALT_DRIVER_VIRKSOMHET) || {})
);

export const forutgaendeMedlemskap = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP) || {})
);

export const bosattINorge = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.BOSATT_I_NORGE) || {})
);

export const art11_3A = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART11_3A) || {})
);

export const art11_4_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.lovvalgsbestemmelser.tillegg.FO_883_2004_ART11_4_1) || {})
);

export const art11_4_2 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.lovvalgsbestemmelser.forordning_883_2004.FO_883_2004_ART11_4_2) || {})
);

export const nis = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP) || {})
);

export const art12_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_ART12_1) || {})
);

export const art12_2 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_ART12_2) || {})
);

export const art16_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_ART12_2) || {})
);

export const valgteLovvalgsVilkar = createSelector(
  state => VilkarSelector(state),
  alleVilkar => {
    const alleLovvalg = [
      ...MKV.KTObjects.lovvalgsbestemmelser.forordning_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.forordning_987_2009,
      ...MKV.KTObjects.lovvalgsbestemmelser.tillegg,
    ];
    return alleVilkar.filter(enkeltVilkar => alleLovvalg.find(enkeltLovvalg => enkeltLovvalg.kode === enkeltVilkar.vilkaar));
  }
);
