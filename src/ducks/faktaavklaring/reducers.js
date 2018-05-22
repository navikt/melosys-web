/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

import { formatterDatoTilISO } from '../../utils/dato';
import { STATUS } from '../../services/utils';
import * as Types from './types';

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
        data: action.data,
      };
    case Types.OPPDATER_FAKTAAVKLARING: {
      const { dokument } = action;
      const faktaavklaring = {
        ...state.data.faktaavklaring,
        opphold: {
          land: dokument.faktaavklaringOppholdsLand,
          periode: {
            fom: formatterDatoTilISO(dokument.faktaavklaringPeriodeFraOgMed),
            tom: formatterDatoTilISO(dokument.faktaavklaringPeriodeTilOgMed),
          },
        },
        sysselsetting: {
          sysselsettingType: dokument.faktaavklaringSysselsettingType,
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
        valgteArbeidsforhold: [...dokument.faktaavklaringValgteArbeidsforhold],
        sektor: {
          ansattISektor: dokument.faktaavklaringAnsattISektor,
        },
        bostedsland: {
          bekrefterFamiliebosted: dokument.faktaavklaringBekrefterFamiliebosted,
          bekrefterDisponering: dokument.faktaavklaringBekrefterDisponering,
          bostedsland: dokument.faktaavklaringBostedsland,
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
      };

      return { ...state, data: { ...state.data, faktaavklaring } };
    }
    default:
      return state;
  }
}
