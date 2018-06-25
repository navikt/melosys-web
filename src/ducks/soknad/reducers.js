import { STATUS } from '../../services/utils';

import * as Types from './types';

import { strengTilBool, strengTilInt } from '../../utils/streng';
import { formatterDatoTilISO } from '../../utils/dato';

/**
 * Reducers
 * ----------------------------------------------------------------------------------
 * Dette er Redux-reducere som håndterer state-manipulasjon direkte, basert på
 * action types som sendes inn sammen med dataene.
 */

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
    foretakUtland: {
      foretakUtlandNavn: undefined,
      foretakUtlandOrgnr: undefined,
      foretakUtlandAdresse: undefined,
    },
    oppholdUtland: {
      oppholdsland: undefined,
      oppholdsPeriode: { fom: undefined, tom: undefined },
      sammeAdresseSomArbeidsgiver: undefined,
      ektefelleEllerBarn: undefined,
      forutgaendeBostedINorge: undefined,
      studentSemester: undefined,
      studentFinansiering: undefined,
      studieLand: undefined,
    },
    arbeidNorge: {
      valgteArbeidsforhold: [],
      arbeidsforholdOpprettholdIHelePerioden: undefined,
      selvstendigFortsetterEtterArbeidIUtlandet: undefined,
      brukerErSelvstendigNaeringsdrivende: undefined,
      arbeidsforholdVikarNavn: undefined,
      vikarOrgnr: undefined,
      flyendePersonellHjemmebase: undefined,
      ansattPaSokkelEllerSkip: undefined,
      navnSkipEllerSokkel: undefined,
      sokkelLand: undefined,
      skipFartsomrade: undefined,
      skipFlaggLand: undefined,
      kontaktNavn: undefined,
      kontaktEpost: undefined,
      fullmektigFirma: undefined,
      fullmektigAdresse: undefined,
    },
    juridiskArbeidsgiverNorge: {
      antallAnsatte: undefined,
      antallAdminAnsatte: undefined,
      antallAdminAnsatteEOS: undefined,
      andelOmsetningINorge: undefined,
      andelKontrakterINorge: undefined,
      erBemanningsbyra: undefined,
      hattDriftSiste12Mnd: undefined,
      antallUtsendte: undefined,
    },
    arbeidsinntekt: {
      inntektNorskIPerioden: undefined,
      inntektUtenlandskIPerioden: undefined,
      inntektNaeringIPerioden: undefined,
      inntektNaturalYtelser: [],
      inntektErInnrapporteringspliktig: undefined,
      inntektTrygdeavgiftBlirTrukket: undefined,
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
    tilleggsopplysninger: undefined,
  };


// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
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
    case Types.OPPDATER_SOKNAD: {
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
          oppholdsland: dokument.faktaavklaringOppholdsLand,
          oppholdsPeriode: {
            ...state.data.soknadDokument.oppholdUtland.oppholdsPeriode,
            fom: formatterDatoTilISO(dokument.faktaavklaringPeriodeFraOgMed),
            tom: formatterDatoTilISO(dokument.faktaavklaringPeriodeTilOgMed),
          },
          sammeAdresseSomArbeidsgiver: strengTilBool(dokument.sammeAdresseSomArbeidsgiver),
          ektefelleEllerBarnINorge: strengTilBool(dokument.ektefelleEllerBarnINorge),
          forutgaendeBostedINorge: strengTilBool(dokument.forutgaendeBostedINorge),
          EOSBarnetrygdFraNAV: strengTilBool(dokument.EOSBarnetrygdFraNAV),
          adresseIUtlandet: strengTilBool(dokument.adresseIUtlandet),
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
