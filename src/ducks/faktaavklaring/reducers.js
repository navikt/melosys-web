/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { formatterDatoTilISO } from '../../utils/dato';
import { STATUS } from '../../services/utils';
import * as Types from './types';

import { VurderingBostedslandTyper } from '../../felles-komponenter/vilkarsveileder/vurderinger/vurderingBostedsland';

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
    case Types.OPPDATER_FAKTAAVKLARING: {
      const { dokument } = action;
      const avklaring = {
        opphold: {
          land: dokument.faktaavklaringOppholdsLand,
          periode: {
            fom: formatterDatoTilISO(dokument.faktaavklaringPeriodeFraOgMed),
            tom: formatterDatoTilISO(dokument.faktaavklaringPeriodeTilOgMed),
          },
        },
        sysselsetting: {
          sysselsettingType: dokument.faktaavklaringSysselsettingType,
          ikkeYrkesaktivType: dokument.faktaavklaringIkkeYrkesaktivType,
        },
        aktivitet: {
          aktivitetLand: dokument.faktaavklaringAktivitetLand,
        },
        utsending: {
          ansattINorskSelskap: dokument.faktaavklaringAnsattINorskSelskap,
          erstatterTidligereUtsendt: dokument.faktaavklaringErstatterTidligereUtsendt,
          utsendingMindreEnn24Mnd: dokument.faktaavklaringUtsendingMindreEnn24Mnd,
          foretakDriverINorge: dokument.faktaavklaringForetakDriverINorge,
          harForutgaendeMedlemskap: dokument.faktaavklaringHarForutgaendeMedlemskap,
          arbeidKnyttetTilVirksomhetUtlandet: dokument.faktaavklaringArbeidKnyttetTilVirksomhetUtlandet,
          sammeTypeVirksomhet: dokument.faktaavklaringSammeTypeVirksomhet,
        },
        valgteArbeidsgivere: [...dokument.faktaavklaringValgteArbeidsgivere],
        sektor: {
          ansattISektor: dokument.faktaavklaringAnsattISektor,
        },
        bosted: {
          bostedLand: (dokument.faktaavklaringBostedTerritorie === VurderingBostedslandTyper.NORGE ? 'NO' : dokument.faktaavklaringBostedLand),
          bostedBegrunnelser: dokument.faktaavklaringBostedBegrunnelser,
        },
        yrkesaktivitetFordeling: {
          antallLand: dokument.faktaavklaringAntallLand,
        },
        virksomhet: {
          aktivitetINorge: dokument.faktaavklaringAktivitetINorge,
          marginaltArbeid: dokument.faktaavklaringMarginaltArbeid,
          vekslingMellomLand: dokument.faktaavklaringVekslingMellomLand,
        },
        tjenestemann: {
          tjenestemann: dokument.faktaavklaringTjenestemann,
        },
        forretningssted: {
          land: dokument.faktaavklaringForretningsstedLand,
          antallArbeidsgivere: dokument.faktaavklaringForretningsstedAntallArbeidsgivere,
          fordelingArbeidsgivere: dokument.faktaavklaringForretningsstedFordelingArbeidsgivere,
        },
        vesentligVirksomhet: {
          vesentligVirksomhetINorge: dokument.faktaavklaringVesentligVirksomhetINorge,
          vesentligVirksomhetBegrunnelser: dokument.faktaavklaringVesentligVirksomhetBegrunnelser,
        },
      };

      return { ...state, data: { ...state.data, avklaring: { ...avklaring } } };
    }
    default:
      return state;
  }
}
