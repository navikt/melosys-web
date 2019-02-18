/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import * as MKV from 'melosys-kodeverk';

import { createSelector } from 'reselect';
import { VilkarSelector } from '../vilkar/selectors';

// import * as Koder from '../../kodeverk';

// selector(s)
export const LovvalgsperioderSelector = createSelector(
  state => (state.lovvalgsperioder.data ? state.lovvalgsperioder.data : []),
  lovvalgsperioder => lovvalgsperioder
);

export const LovvalgBestemmelseSelector = createSelector(
  state => VilkarSelector(state),
  () => [...MKV.KTObjects.lovvalgsbestemmelser.forordning_883_2004, ...MKV.KTObjects.lovvalgsbestemmelser.forordning_987_2009],
  (alleVilkar, alleLovvalg) => {
    const lovvalgBestemmelse = alleVilkar.find(vilkar => alleLovvalg.find(lovvalg => lovvalg.kode === vilkar.vilkaar));
    if (lovvalgBestemmelse) return lovvalgBestemmelse.vilkaar;
    return undefined;
  }
);
