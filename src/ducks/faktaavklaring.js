import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

// Actions
const OK = 'faktaavklaring/OK';
const FEILET = 'faktaavklaring/FEILET';
const PENDING = 'faktaavklaring/PENDING';
const OPPDATER_FAKTAAVKLARING = 'faktaavklaring/OPPDATER_FAKTAAVKLARING';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case OPPDATER_FAKTAAVKLARING: {
      const { dokument } = action;
      const faktaavklaring = {
        ...state.data.faktaavklaring,
        periode: {
          land: dokument.faktaavklaringOppholdsLand,
          periodeFraOgMed: dokument.faktaavklaringPeriodeFraOgMed,
          periodeTilOgMed: dokument.faktaavklaringPeriodeTilOgMed,
        },
        sysselsetting: {
          sysselsettingType: dokument.faktaavklaringSysselsettingType,
        },
        utsending: {
          ansattINorskSelskap: dokument.faktaavklaringAnsattINorskSelskap,
          erstatterTidligereUtsendt: dokument.faktaavklaringErstatterTidligereUtsendt,
          utsendingMindreEnn24Mnd: dokument.faktaavklaringUtsendingMindreEnn24Mnd,
        },
        sektor: {
          ansattISektor: dokument.faktaavklaringAnsattISektor,
        },
        virksomhet: {
          antallLand: dokument.faktaavklaringAntallLand,
          aktivitetINorge: dokument.faktaavklaringAktivitetINorge,
          antallArbeidsgivere: dokument.faktaavklaringAntallArbeidsgivere,
          fordelingArbeidsgivere: dokument.faktaavklaringFordelingArbeidsgivere,
        },
      };

      return { ...state, data: { ...state.data, faktaavklaring } };
    }
    default:
      return state;
  }
}

// Action Creators
export function hentFaktaavklaring(behandlingID) {
  return doThenDispatch(() => Api.hentFaktaavklaring(behandlingID), {
    OK,
    FEILET,
    PENDING,
  });
}

export function sendFaktaavklaring(dokument) {
  return doThenDispatch(() => Api.sendFaktaavklaring(dokument), {
    OK,
    FEILET,
    PENDING,
  });
}

export function oppdaterFaktaavklaringState(dokument) {
  return ({
    type: OPPDATER_FAKTAAVKLARING,
    dokument,
  });
}

// selector(s)
export const FaktaavklaringSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data : {}),
  faktaavklaring => faktaavklaring
);

export const FaktaavklaringPeriodeSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.periode : {}),
  periode => periode
);

export const FaktaavklaringSysselsettingSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.sysselsetting : {}),
  sysselsetting => sysselsetting
);

export const FaktaavklaringUtsendingSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.utsending : {}),
  utsending => utsending
);

export const FaktaavklaringSektorSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.sektor : {}),
  sektor => sektor
);

export const FaktaavklaringVirksomhetSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.virksomhet : {}),
  virksomhet => virksomhet
);
