/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import * as MKV from 'melosys-kodeverk';

import { STATUS } from '../../services/utils';

import * as Types from './types';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

const vilkarTilObjekt = (vilkaar, oppfylt, begrunnelseKoder, begrunnelseFritekst) => (
  (oppfylt === undefined || oppfylt === null) ? null : {
    vilkaar,
    oppfylt: oppfylt === 'true' || oppfylt,
    begrunnelseKoder: begrunnelseKoder || [],
    begrunnelseFritekst: begrunnelseFritekst || null,
  }
);

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_VILKAR: {
      // Gjennomgå alle vilkår som kan være satt. Dersom de er 'undefined', vil det si at
      // saksbehandler ikke har vært innom denne vurderingen og kanskje aldri kommer tid. Siden
      // det da ikke er et vilkår som er vurdert, skal det heller ikke inn i modellen eller sendes backend.
      /* eslint-disable max-len */
      const vilkarArray = [
        vilkarTilObjekt(MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP, action.data.vilkar.forutgaendeMedlemskap, action.data.vilkar.forutgaendeMedlemskapBegrunnelser),
        vilkarTilObjekt(MKV.Koder.vilkaar.ART12_1_VESENTLIG_VIRKSOMHET, action.data.vilkar.vesentligVirksomhet, action.data.vilkar.vesentligVirksomhetBegrunnelser),
        vilkarTilObjekt(MKV.Koder.vilkaar.ART12_2_NORMALT_DRIVER_VIRKSOMHET, action.data.vilkar.normaltDriverVirksomhet, action.data.vilkar.normaltDriverVirksomhetBegrunnelser),
        vilkarTilObjekt(MKV.Koder.vilkaar.BOSATT_I_NORGE, action.data.vilkar.bosattINorge, action.data.vilkar.bosattINorgeBegrunnelser),
        vilkarTilObjekt(MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP, action.data.vilkar.nis),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART12_1, action.data.vilkar.art12_1, action.data.vilkar.art12_1_begrunnelser),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART12_2, action.data.vilkar.art12_2, action.data.vilkar.art12_2_begrunnelser),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, action.data.vilkar.art16_1, action.data.vilkar.art16_1_begrunnelser, action.data.vilkar.art16_1_begrunnelser_fritekst),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART11_3A, action.data.vilkar.art11_3A),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART11_4_1, action.data.vilkar.art11_4_1),
        vilkarTilObjekt(MKV.Koder.vilkaar.FO_883_2004_ART11_4_2, action.data.vilkar.art11_4_2),
      ].filter(vilkar => vilkar !== null);
      /* eslint-enable max-len */
      return {
        data: vilkarArray,
      };
    }
    default:
      return state;
  }
}
