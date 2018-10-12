/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { formatterDatoTilISO } from '../../utils/dato';
import { STATUS } from '../../services/utils';
import * as Types from './types';

import { VurderingBostedslandTyper } from '../../felles-komponenter/stegvelger/stegKomponenter/vurderingBostedsland';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
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
    case Types.PENDING_BOSTED:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET_BOSTED:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK_BOSTED:
      return {
        ...state,
        status: STATUS.OK,
        data: { ...state.data, avklaring: { ...state.data.avklaring, bosted: { ...state.data.avklaring.bosted, vurdering: action.data } } },
      };
    case Types.OPPDATER_AVKLARTEFAKTA: {
      const { dokument } = action;
      const avklaring = {
        opphold: {
          land: dokument.avklartefaktaOppholdsLand,
          periode: {
            fom: formatterDatoTilISO(dokument.avklartefaktaPeriodeFraOgMed),
            tom: formatterDatoTilISO(dokument.avklartefaktaPeriodeTilOgMed),
          },
        },
        sysselsetting: {
          sysselsettingType: dokument.avklartefaktaSysselsettingType,
          ikkeYrkesaktivType: dokument.avklartefaktaIkkeYrkesaktivType,
        },
        aktivitet: {
          aktivitetLand: dokument.avklartefaktaAktivitetLand,
        },
        valgteArbeidsgivere: [...dokument.avklartefaktaValgteArbeidsgivere],
        yrkesaktivitet: {
          yrkesaktivitetType: dokument.avklartefaktaYrkesaktivitetType,
        },
        bosted: {
          bostedLand: (dokument.avklartefaktaBostedNorgeUtland === VurderingBostedslandTyper.NORGE ? 'NO' : dokument.avklartefaktaBostedLand),
        },
        yrkesaktivitetFordeling: {
          antallLand: dokument.avklartefaktaAntallLand,
        },
        virksomhet: {
          aktivitetINorge: dokument.avklartefaktaAktivitetINorge,
          marginaltArbeid: dokument.avklartefaktaMarginaltArbeid,
          vekslingMellomLand: dokument.avklartefaktaVekslingMellomLand,
        },
        tjenestemann: {
          tjenestemann: dokument.avklartefaktaTjenestemann,
        },
      };

      return { ...state, data: { ...state.data, avklaring: { ...avklaring } } };
    }
    default:
      return state;
  }
}
