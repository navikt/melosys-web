/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */
import { StateSection } from 'AppTypes';
import { Avklartfakta } from 'Domene';

import MKV from '../../melosyskodeverk';

import { STATUS } from '../../services/utils';
import * as Utils from '../../utils';
import * as Types from './types';
import * as KV from '../../kodeverk';

export const initialState: StateSection<Types.Data> = {
  data: [],
  status: STATUS.NOT_STARTED,
};

const lagAvklartfaktaObjekterMedKode = (avklarteFakta: Avklartfakta[], avklartefaktaKode: string | null): Avklartfakta[] => {
  if (Utils._isNil(avklarteFakta)) {
    return [];
  }

  return avklarteFakta.map(enkeltAvklaring => ({
    avklartefaktaKode,
    referanse: enkeltAvklaring.referanse,
    fakta: enkeltAvklaring.fakta,
    subjektID: enkeltAvklaring.subjektID || null,
    begrunnelseKoder: enkeltAvklaring.begrunnelseKoder || [],
    begrunnelseFritekst: enkeltAvklaring.begrunnelseFritekst !== undefined ? enkeltAvklaring.begrunnelseFritekst : null,
  }));
};

export default function reducer(state = initialState, action: Types.Action): StateSection<Types.Data> {
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
      const { data: avklartefakta } = action;

      const {
        VIRKSOMHET,
        YRKESGRUPPE,
        BOSTEDSLAND,
        SOKKEL_ELLER_SKIP,
        ARBEIDSLAND,
        ARBEID_SOKKEL_SKIP,
        AARSAK_ENDRING_PERIODE,
        MARGINALT_ARBEID,
        INFORMERT_MYNDIGHET,
      } = MKV.Koder.avklartefaktatyper;

      const {
        SOKNADSLAND,
        YRKESAKTIVITET,
        SOKNADSPERIODE,
        avklartefaktaKoder: {
          AKTIVITET_I_NORGE,
          ARBEID_UTFORES_I_OPPGITT_LAND,
          ARBEIDSGIVERS_FORRETNINGSSTED,
          OMFATTES_I_NORGE,
          OMFATTES_I_LAND,
          LOENNET_ARBEID_ANTALL_LAND,
          OFFENTLIG_ARBEID_ANTALL_LAND,
        },
        referanseKoder: {
          INSTALLASJON_ARBEIDSLAND,
          INSTALLASJON_ARBEIDSLAND_TYPE,
        },
      } = KV.Koder;

      const avklartefaktaUt = [
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[SOKNADSLAND], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[VIRKSOMHET], VIRKSOMHET),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[YRKESGRUPPE], YRKESGRUPPE),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[YRKESAKTIVITET], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[AKTIVITET_I_NORGE], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[MARGINALT_ARBEID], MARGINALT_ARBEID),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[ARBEIDSGIVERS_FORRETNINGSSTED], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[OMFATTES_I_NORGE], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[OMFATTES_I_LAND], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[BOSTEDSLAND], BOSTEDSLAND),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[SOKKEL_ELLER_SKIP], SOKKEL_ELLER_SKIP),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[ARBEIDSLAND], ARBEIDSLAND),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[INSTALLASJON_ARBEIDSLAND], ARBEIDSLAND),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[INSTALLASJON_ARBEIDSLAND_TYPE], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[ARBEID_SOKKEL_SKIP], ARBEID_SOKKEL_SKIP),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[AARSAK_ENDRING_PERIODE], AARSAK_ENDRING_PERIODE),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[ARBEID_UTFORES_I_OPPGITT_LAND], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[LOENNET_ARBEID_ANTALL_LAND], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[OFFENTLIG_ARBEID_ANTALL_LAND], null),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[INFORMERT_MYNDIGHET], INFORMERT_MYNDIGHET),
        ...lagAvklartfaktaObjekterMedKode(avklartefakta[SOKNADSPERIODE], SOKNADSPERIODE),
      ].filter(fakta => fakta !== null);

      return { ...state, data: [...avklartefaktaUt] };
    }
    default:
      return state;
  }
}
