import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';
import { strengTilBool, strengTilInt } from '../utils/utils';
import { formatterDatoTilISO } from '../utils/dato';

import { ArbeidsforholdeneSelector } from './fagsaker';

// Actions
const OK = 'soknad/OK';
const FEILET = 'soknad/FEILET';
const PENDING = 'soknad/PENDING';
const OPPDATER_SOKNAD = 'soknad/OPPDATER_SOKNAD';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

const soknadTemplate =
  {
    arbeidUtland: {
      arbeidsland: [],
      arbeidsperiode: { fom: undefined, tom: undefined },
      arbeidsandelNorge: undefined,
      arbeidsandelUtland: undefined,
      bostedsland: undefined,
      erstatterTidligereUtsendt: undefined,
    },
    foretakUtland: { foretakUtlandNavn: undefined, foretakUtlandOrgnr: undefined },
    oppholdUtland: {
      oppholdsland: undefined,
      oppholdsPeriode: { fom: undefined, tom: undefined },
      studentIEOS: undefined,
      studentFinansiering: undefined,
      studentSemester: undefined,
      studieLand: undefined,
    },
    arbeidNorge: {
      arbeidsforholdOpprettholdIHelePerioden: undefined,
      selvstendigFortsetterEtterArbeidIUtlandet: undefined,
      vikarOrgnr: undefined,
      flyendePersonellHjemmebase: undefined,
      navnSkipEllerSokkel: undefined,
      sokkelLand: undefined,
      skipFlaggLand: undefined,
      brukerErSelvstendigNaeringsdrivende: true,
      ansattPaSokkelEllerSkip: undefined,
      skipFartsomrade: undefined,
    },
    juridiskArbeidsgiverNorge: {
      antallAnsatte: undefined,
      antallAdminAnsatte: undefined,
      andelOmsetningINorge: undefined,
      andelKontrakterINorge: undefined,
      erBemanningsbyra: undefined,
      hattDriftSiste12Mnd: undefined,
      antallUtsendte: undefined,
      antallAdminAnsatteEOS: undefined,
    },
    arbeidsgiversBekreftelse: {
      arbeidsgiverBekrefterUtsendelse: undefined,
      arbeidstakerAnsattUnderUtsendelsen: undefined,
      erstatterArbeidstakerenUtsendte: undefined,
      arbeidstakerTidligereUtsendt24Mnd: undefined,
      arbeidsgiverBetalerArbeidsgiveravgift: undefined,
      trygdeavgiftTrukketGjennomSkatt: undefined,
      trygdeavgiftTrukketGjennomSkattDato: undefined,
    },
    arbeidsinntekt: {
      inntektNorskIPerioden: undefined,
      inntektUtenlandskIPerioden: undefined,
      inntektNaeringIPerioden: undefined,
      inntektNaturalYtelser: [],
      inntektErInnrapporteringspliktig: undefined,
      inntektTrygdeavgiftBlirTrukket: undefined,
    },
    tilleggsopplysninger: undefined,
  };


// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK: {
      const soknadData = action.data;

      if (!soknadData.soknadDokument) {
        soknadData.soknadDokument = { ...soknadTemplate };
      }

      return {
        ...state,
        status: STATUS.OK,
        data: soknadData,
      };
    }
    case OPPDATER_SOKNAD: {
      const { dokument } = action;
      const soknad = {
        ...state.data.soknadDokument,
        arbeidsinntekt: {
          ...state.data.soknadDokument.arbeidsinntekt,
          inntektNorskIPerioden: strengTilInt(dokument.inntektNorskIPerioden),
          inntektUtenlandskIPerioden: strengTilInt(dokument.inntektUtenlandskIPerioden),
          inntektNaeringIPerioden: strengTilInt(dokument.inntektNaeringIPerioden),
        },
        arbeidNorge: {
          ...state.data.soknadDokument.arbeidNorge,
          valgteArbeidsforhold: dokument.valgteArbeidsforhold,
        },
        arbeidsgiversBekreftelse: {
          ...state.data.soknadDokument.arbeidsgiversBekreftelse,
          arbeidsgiverBekrefterUtsendelse: strengTilBool(dokument.arbeidsgiverBekrefterUtsendelse),
          arbeidstakerAnsattUnderUtsendelsen: strengTilBool(dokument.arbeidstakerAnsattUnderUtsendelsen),
          erstatterArbeidstakerenUtsendte: strengTilBool(dokument.erstatterArbeidstakerenUtsendte),
          arbeidstakerTidligereUtsendt24Mnd: strengTilBool(dokument.arbeidstakerTidligereUtsendt24Mnd),
          arbeidsgiverBetalerArbeidsgiveravgift: strengTilBool(dokument.arbeidsgiverBetalerArbeidsgiveravgift),
          trygdeavgiftTrukketGjennomSkatt: strengTilBool(dokument.trygdeavgiftTrukketGjennomSkatt),
          trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilISO(dokument.trygdeavgiftTrukketGjennomSkattDato),
        },
        oppholdUtland: {
          ...state.data.soknadDokument.oppholdUtland,
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
  return doThenDispatch(() => Api.hentSoknader(behandlingID), {
    OK,
    FEILET,
    PENDING,
  });
}

export function sendSoknad(bid, soknad) {
  return doThenDispatch(() => Api.sendSoknad(bid, soknad), {
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
  arbeidNorge => arbeidNorge || {}
);

export const ValgteArbeidsforhold = createSelector(
  state => ArbeidNorgeSelector(state).valgteArbeidsforhold || [],
  state => ArbeidsforholdeneSelector(state),
  (valgteArbeidsforhold, alleArbeidsforhold) => (
    valgteArbeidsforhold ? valgteArbeidsforhold.reduce((samling, valgtArbeidsforholdID) => {
      const funnetArbeidsforhold = alleArbeidsforhold.find(arbeidsforholdet => arbeidsforholdet.arbeidsforholdIDnav === valgtArbeidsforholdID);
      return funnetArbeidsforhold ? [...samling, funnetArbeidsforhold] : [...samling];
    }, []) : [])
);

export const ArbeidUtlandSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidUtland : {}),
  soknad => soknad || {}
);

export const ArbeidsinntektSelector = createSelector(
  state => (state.soknad.data.soknadDokument ? state.soknad.data.soknadDokument.arbeidsinntekt : {}),
  soknad => soknad || {}
);

export const ForetakUtlandSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.foretakUtland,
  soknad => soknad || {}
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  state => state.soknad.data.soknadDokument && state.soknad.data.soknadDokument.juridiskArbeidsgiverNorge,
  soknad => soknad || {}
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
