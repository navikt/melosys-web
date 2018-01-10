import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';
import { strengTilBool, strengTilInt } from '../utils/utils';

// Actions
const OK = 'soknad/OK';
const FEILET = 'soknad/FEILET';
const PENDING = 'soknad/PENDING';
const OPPDATER_SOKNAD = 'sokna/OPPDATER_SOKNAD';

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
    case OPPDATER_SOKNAD: {
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
export function hentSoknad(behandlingID) {
  return doThenDispatch(() => Api.hentSoknad(behandlingID), {
    OK,
    FEILET,
    PENDING,
  });
}

export function sendSoknad(dokument) {
  return doThenDispatch(() => Api.sendSoknad(dokument), {
    OK,
    FEILET,
    PENDING,
  });
}

export function oppdaterSoknadState(dokument) {
  return ({
    type: OPPDATER_SOKNAD,
    dokument,
  });
}

// selector(s)
export const SoknadSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data,
  soknad => soknad
);

export const SoknadIDSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data,
  soknad => soknad.id
);

export const ArbeidNorgeSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidNorge : {}),
  soknad => soknad
);

export const ArbeidUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.arbeidUtland,
  soknad => soknad
);

export const ArbeidsinntektSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidsinntekt : {}),
  soknad => soknad
);

export const ForetakUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.foretakUtland,
  soknad => soknad
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.juridiskArbeidsgiverNorge,
  soknad => soknad
);

export const OppholdUtlandSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.oppholdUtland : {}),
  soknad => soknad || {}
);

export const ArbeidsgiversBekreftelseSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidsgiversBekreftelse : {}),
  soknad => soknad || {}
);


export const OvrigSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.ovrig,
  soknad => soknad
);
