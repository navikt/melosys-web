import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';
import { strengTilBool, strengTilInt } from '../utils/utils';

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
      const soknad = {
        ...state.data.soknadDokument,
        arbeidsinntekt: {
          inntektNorskIPerioden: strengTilInt(dokument.inntektNorskIPerioden),
          inntektUtenlandskIPerioden: strengTilInt(dokument.inntektUtenlandskIPerioden),
          inntektNaeringIPerioden: strengTilInt(dokument.inntektNaeringIPerioden),
        },
        arbeidNorge: {
          valgteArbeidsforhold: dokument.valgteArbeidsforhold,
        },
        arbeidsgiversBekreftelse: {
          arbeidsgiverBekrefterUtsendelse: strengTilBool(dokument.arbeidsgiverBekrefterUtsendelse),
          arbeidstakerAnsattUnderUtsendelsen: strengTilBool(dokument.arbeidstakerAnsattUnderUtsendelsen),
          erstatterArbeidstakerenUtsendte: strengTilBool(dokument.erstatterArbeidstakerenUtsendte),
          arbeidstakerTidligereUtsendt24Mnd: strengTilBool(dokument.arbeidstakerTidligereUtsendt24Mnd),
          arbeidsgiverBetalerArbeidsgiveravgift: strengTilBool(dokument.arbeidsgiverBetalerArbeidsgiveravgift),
          trygdeavgiftTrukketGjennomSkatt: strengTilBool(dokument.trygdeavgiftTrukketGjennomSkatt),
          trygdeavgiftTrukketGjennomSkattDato: dokument.trygdeavgiftTrukketGjennomSkattDato,
        },
        oppholdUtland: {
          studentIEOS: dokument.studentIEOS,
          studentSkole: dokument.studentSkole,
          studentSemester: dokument.studentSemester,
          studieLand: dokument.studieLand,
          studentFinansiering: dokument.studentFinansiering,
        },
      };

      return { ...state, data: { ...state.data, soknadDokument: soknad } };
    }
    default:
      return state;
  }
}

// Action Creators
export function hentFaktaavklaring(behandlingsID) {
  return doThenDispatch(() => Api.hentFaktaavklaring(behandlingsID), {
    OK,
    FEILET,
    PENDING,
  });
}

export function sendFaktaavklaring(dokument) {
  return doThenDispatch(() => Api.sendSoknad(dokument), {
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
  state => (state.faktaavklaring.data.faktaavklaring ? state.soknad.faktaavklaring : {}),
  faktaavklaring => faktaavklaring
);

export const FaktaavklaringArbeidstypeSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.soknad.faktaavklaring.arbeidstype : {}),
  arbeidstype => arbeidstype
);

export const FaktaavklaringUtsendingSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.soknad.faktaavklaring.utsending : {}),
  utsending => utsending
);

export const FaktaavklaringSektorSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.soknad.faktaavklaring.sektor : {}),
  sektor => sektor
);

export const FaktaavklaringVirksomhetSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.soknad.faktaavklaring.virksomhet : {}),
  virksomhet => virksomhet
);
