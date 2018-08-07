import { STATUS } from '../../services/utils';

import * as Types from './types';

import { strengTilInt } from '../../utils/streng';
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
      adresse: {
        gatenavn: undefined,
        postnummer: undefined,
        poststed: undefined,
        land: undefined,
      },
      arbeidsandelUtland: undefined,
      arbeidsandelNorge: undefined,
      arbeidUtlandHjemmekontor: undefined,
      arbeidUtlandErstatning: undefined,
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
    bosted: {
      oppgittAdresse: undefined,
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
    personOpplysninger: {
      utenlandskID: undefined,
      medfolgendeBarn: undefined,
      medfolgendeAndre: undefined,
    },
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
        arbeidUtland: {
          adresse: {
            gatenavn: dokument.arbeidUtlandGatenavn,
            postnummer: dokument.arbeidUtlandPostnummer,
            poststed: dokument.arbeidUtlandPoststed,
            land: dokument.arbeidUtlandLand,
          },
          arbeidsandelUtland: dokument.arbeidsandelUtland,
          arbeidsandelNorge: dokument.arbeidsandelNorge,
          arbeidUtlandHjemmekontor: dokument.arbeidUtlandHjemmekontor,
          arbeidUtlandErstatning: dokument.arbeidUtlandErstatning,
        },
        arbeidsgiversBekreftelse: {
          ...state.data.soknadDokument.arbeidsgiversBekreftelse,
          arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
          arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
          erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
          arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
          arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
          trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
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
          sammeAdresseSomArbeidsgiver: dokument.sammeAdresseSomArbeidsgiver,
          ektefelleEllerBarnINorge: dokument.harEktefelleEllerBarnINorge,
          forutgaendeBostedINorge: dokument.harForutgaendeBostedINorge,
          EOSBarnetrygdFraNAV: dokument.EOSBarnetrygdFraNAV,
          adresseIUtlandet: dokument.adresseIUtlandet,
          studentSemester: dokument.studentSemester,
          studieLand: dokument.studieLand,
          studentFinansiering: dokument.studentFinansiering,
        },
        bosted: {
          oppgittAdresse: {
            gatenavn: dokument.oppgittAdresseGatenavn,
            postnummer: dokument.oppgittAdressePostnummer,
            poststed: dokument.oppgittAdressePoststed,
            land: dokument.oppgittAdresseLand,
          },
        },
        maritimtArbeid: {
          ...state.data.soknadDokument.maritimtArbeid,
          maritimType: dokument.maritimType,
          skipsNavn: dokument.skipsNavn,
          fartsomrade: dokument.fartsomrade,
          flaggLand: dokument.flaggLand,
          installasjonsLand: dokument.installasjonsLand,
        },
        selvstendigArbeid: {
          erSelvstendig: dokument.erSelvstendig,
          selvstendigForetak: dokument.selvstendigForetak,
        },
        personOpplysninger: {
          utenlandskID: dokument.utenlandskID,
          medfolgendeBarn: dokument.medfolgendeBarn,
          medfolgendeAndre: dokument.medfolgendeAndre,
        },
      };

      return { ...state, data: { ...state.data, soknadDokument: soknad } };
    }
    default:
      return state;
  }
}
