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

export const art11_3A = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.lovvalgsbestemmelser.lovvalgsbestemmelser_883_2004.FO_883_2004_ART11_3A) || {})
);

export const art11_4_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1) || {})
);

export const art11_4_2 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.lovvalgsbestemmelser.lovvalgsbestemmelser_883_2004.FO_883_2004_ART11_4_2) || {})
);

export const nis = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP) || {})
);

export const art12_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_ART12_1) || {})
);

export const art12_1_begrunnelserSelector = createSelector(
  state => art12_1(state),
  art12_1_vilkar => art12_1_vilkar.begrunnelseKoder || []
);

export const art12_2 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_ART12_2) || {})
);

export const art12_2_begrunnelserSelector = createSelector(
  state => art12_2(state),
  art12_2_vilkar => art12_2_vilkar.begrunnelseKoder || []
);

export const art16_1 = createSelector(
  state => VilkarSelector(state),
  alleVilkar => (alleVilkar.find(enkelt => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_ART16_1) || {})
);

export const art16_1_begrunnelserSelector = createSelector(
  state => art16_1(state),
  art16_1_vilkar => art16_1_vilkar.begrunnelseKoder || []
);

export const art16_1_fritekstSelector = createSelector(
  state => art16_1(state),
  art16_1_vilkar => art16_1_vilkar.begrunnelseFritekst
);

export const valgteLovvalgsVilkar = createSelector(
  state => VilkarSelector(state),
  alleVilkar => {
    const alleLovvalg = [
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgsbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgsbestemmelser_987_2009,
    ];
    return alleVilkar.filter(enkeltVilkar => alleLovvalg.find(enkeltLovvalg => enkeltLovvalg.kode === enkeltVilkar.vilkaar));
  }
);

export const valgteTilleggsVilkar = createSelector(
  state => VilkarSelector(state),
  alleVilkar => {
    const alleTilleggsbestemmelser = [
      ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
    ];
    return alleVilkar.filter(enkeltVilkar => alleTilleggsbestemmelser.find(enkeltTilleggslovvalg => enkeltTilleggslovvalg.kode === enkeltVilkar.vilkaar));
  }
);

export const vilkarBegrunnelserSelector = createSelector(
  state => vesentligVirksomhetSelector(state),
  state => normaltDriverVirksomhetSelector(state),
  state => forutgaendeMedlemskap(state),
  (vesentligvirksomhet, normaltDrivervirksomhet, forutgaendemedlemskap) => ([
    ...(vesentligvirksomhet.begrunnelseKoder || []),
    ...(normaltDrivervirksomhet.begrunnelseKoder || []),
    ...(forutgaendemedlemskap.begrunnelseKoder || []),
  ] || [])
);
