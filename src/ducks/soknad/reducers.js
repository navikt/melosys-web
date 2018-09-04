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
    foretakUtland: [],
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
      intensjonOmRetur: undefined,
      antallMaanederINorge: undefined,
      EOSBarnetrygdFraNAV: undefined,
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
      fullmektigGateadresse: undefined,
      fullmektigPostnr: undefined,
      fullmektigPoststed: undefined,
      fullmektigRegion: undefined,
      fullmektigLandKode: undefined,
    },
    juridiskArbeidsgiverNorge: {
      erBemanningsbyra: undefined,
      utsendteNeste12Mnd: undefined,
      antallAdmAnsatte: undefined,
      antallAdminAnsatteEOS: undefined,
      andelOmsetningINorge: undefined,
      andelKontrakterINorge: undefined,
      utsendtFortsetterArbeidsforholdIUtlandet: undefined,
      utsendtArbeiderMedKlienter: undefined,
      utsendtArbeiderMedKontrakter: undefined,
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
      medfolgendeFamilie: undefined,
      medfolgendeAndre: undefined,
    },
    maritimtArbeid: {
      maritimType: undefined,
      skipsNavn: undefined,
      fartsomrade: undefined,
      flaggLand: undefined,
      installasjonsLand: undefined,
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

      if (!soknadData.soeknadDokument) {
        soknadData.soeknadDokument = { ...soknadTemplate };
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
        ...state.data.soeknadDokument,
        arbeidsinntekt: {
          ...state.data.soeknadDokument.arbeidsinntekt,
          inntektNorskIPerioden: strengTilInt(dokument.inntektNorskIPerioden),
          inntektUtenlandskIPerioden: strengTilInt(dokument.inntektUtenlandskIPerioden),
          inntektNaeringIPerioden: strengTilInt(dokument.inntektNaeringIPerioden),
        },
        arbeidNorge: {
          ...state.data.soeknadDokument.arbeidNorge,
          fullmektigFirma: dokument.fullmektigFirma,
          fullmektigGateadresse: dokument.fullmektigGateadresse,
          fullmektigPostnr: dokument.fullmektigPostnr,
          fullmektigPoststed: dokument.fullmektigPoststed,
          fullmektigRegion: dokument.fullmektigRegion,
          fullmektigLandKode: dokument.fullmektigLand,
        },
        arbeidUtland: {
          adresse: {
            gatenavn: dokument.arbeidUtlandGatenavn,
            postnummer: dokument.arbeidUtlandPostnummer,
            poststed: dokument.arbeidUtlandPoststed,
            landKode: dokument.arbeidUtlandLand,
          },
          arbeidsandelUtland: dokument.arbeidsandelUtland,
          arbeidsandelNorge: dokument.arbeidsandelNorge,
          arbeidUtlandHjemmekontor: dokument.arbeidUtlandHjemmekontor,
          arbeidUtlandErstatning: dokument.arbeidUtlandErstatning,
        },
        juridiskArbeidsgiverNorge: {
          erBemanningsbyra: dokument.erBemanningsbyra,
          utsendteNeste12Mnd: dokument.utsendteNeste12Mnd,
          antallAdmAnsatte: dokument.antallAdmAnsatte,
          antallAdminAnsatteEOS: dokument.antallAdminAnsatteEOS,
          andelOmsetningINorge: dokument.andelOmsetningINorge,
          andelKontrakterINorge: dokument.andelKontrakterINorge,
          utsendtFortsetterArbeidsforholdIUtlandet: dokument.utsendtFortsetterArbeidsforholdIUtlandet,
          utsendtArbeiderMedKlienter: dokument.utsendtArbeiderMedKlienter,
          utsendtArbeiderMedKontrakter: dokument.utsendtArbeiderMedKontrakter,
        },
        arbeidsgiversBekreftelse: {
          ...state.data.soeknadDokument.arbeidsgiversBekreftelse,
          arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
          arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
          erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
          arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
          arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
          trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
          trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilISO(dokument.trygdeavgiftTrukketGjennomSkattDato),
        },
        oppholdUtland: {
          ...state.data.soeknadDokument.oppholdUtland,
          oppholdslandKoder: dokument.faktaavklaringOppholdsLand,
          oppholdsPeriode: {
            ...state.data.soeknadDokument.oppholdUtland.oppholdsPeriode,
            fom: formatterDatoTilISO(dokument.faktaavklaringPeriodeFraOgMed),
            tom: formatterDatoTilISO(dokument.faktaavklaringPeriodeTilOgMed),
          },
          sammeAdresseSomArbeidsgiver: dokument.sammeAdresseSomArbeidsgiver,
          ektefelleEllerBarnINorge: dokument.harEktefelleEllerBarnINorge,
          forutgaendeBostedINorge: dokument.harForutgaendeBostedINorge,
          studentSemester: dokument.studentSemester,
          studieLandKode: dokument.studieLand,
          studentFinansiering: dokument.studentFinansiering,
        },
        foretakUtland: dokument.foretakUtland,
        bosted: {
          intensjonOmRetur: dokument.intensjonOmRetur,
          familiesBostedLandKode: dokument.familiesBosted,
          antallMaanederINorge: dokument.antallMaanederINorge,
          EOSBarnetrygdFraNAV: dokument.EOSBarnetrygdFraNAV,
          adresseIUtlandet: dokument.adresseIUtlandet,
          oppgittAdresse: {
            gatenavn: dokument.oppgittAdresseGatenavn,
            postnummer: dokument.oppgittAdressePostnummer,
            poststed: dokument.oppgittAdressePoststed,
            landKode: dokument.oppgittAdresseLand,
          },
        },
        maritimtArbeid: {
          ...state.data.soeknadDokument.maritimtArbeid,
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
          medfolgendeFamilie: dokument.medfolgendeFamilie,
          medfolgendeAndre: dokument.medfolgendeAndre,
        },
      };

      return { ...state, data: { ...state.data, soeknadDokument: soknad } };
    }
    default:
      return state;
  }
}
