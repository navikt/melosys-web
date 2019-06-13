/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { STATUS } from '../../services/utils';
import * as Utils from '../../utils';
import * as Types from './types';

const initialState = {
  data: [],
  status: STATUS.NOT_STARTED,
};

const lagAvklartfaktaObjektMedKode = (avklarteFakta, avklartefaktaKode) => {
  if (Utils._isNil(avklarteFakta)) {
    return [];
  }

  return avklarteFakta.reduce((samling, enkeltAvklaring) => (
    [...samling, {
      avklartefaktaKode,
      referanse: enkeltAvklaring.referanse,
      fakta: enkeltAvklaring.fakta,
      subjektID: enkeltAvklaring.subjektID || null,
      begrunnelseKoder: enkeltAvklaring.begrunnelseKoder || [],
      begrunnelseFritekst: enkeltAvklaring.begrunnelseFritekst !== undefined ? enkeltAvklaring.begrunnelseFritekst : undefined,
    }]
  ), []);
};

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
    case Types.OPPDATER_AVKLARTEFAKTA: {
      const { avklartefakta } = action;
      const avklartefaktaUt = [
        ...lagAvklartfaktaObjektMedKode(avklartefakta.SOKNADSLAND, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.VIRKSOMHET, 'VIRKSOMHET'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.YRKESGRUPPE, 'YRKESGRUPPE'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.YRKESAKTIVITET_ANTALL_LAND, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.YRKESAKTIVITET, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.AKTIVITET_I_NORGE, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.MARGINALT_ARBEID, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.ARBEIDSGIVERS_FORRETNINGSSTED, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.OMFATTES_I_NORGE, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.OMFATTES_I_LAND, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.ARBEIDSMONSTER, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.BOSTEDSLAND, 'BOSTEDSLAND'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.SOKKEL_ELLER_SKIP, 'SOKKEL_ELLER_SKIP'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.INSTALLASJON_ARBEIDSLAND, 'ARBEIDSLAND'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.INSTALLASJON_ARBEIDSLAND_TYPE, null),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.ARBEID_SOKKEL_SKIP, 'ARBEID_SOKKEL_SKIP'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.AARSAK_ENDRING_PERIODE, 'AARSAK_ENDRING_PERIODE'),
        ...lagAvklartfaktaObjektMedKode(avklartefakta.SVAR_ANMODNING_UNNTAK, 'SVAR_ANMODNING_UNNTAK'),
      ].filter(fakta => fakta !== Types.NULL);

      return { ...state, data: [...avklartefaktaUt] };
    }
    default:
      return state;
  }
}
