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

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      const soknadData = action.data;

      return {
        ...state,
        status: STATUS.OK,
        data: soknadData,
      };
    }
    case Types.OPPDATER_PERIODE: {
      const { oppholdsPeriode } = action.data;

      const soknad = {
        ...state.data.soeknadDokument,
        oppholdUtland: {
          ...state.data.soeknadDokument.oppholdUtland,
          oppholdsPeriode: {
            fom: oppholdsPeriode.fom,
            tom: oppholdsPeriode.tom,
          },
        },
      };

      return { ...state, data: { ...state.data, soeknadDokument: soknad } };
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
        arbeidUtland: dokument.arbeidUtland,
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
          ekstraArbeidsgivere: dokument.ekstraArbeidsgivere,
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
          oppholdsPeriode: {
            fom: formatterDatoTilISO(dokument.oppholdUtlandFom),
            tom: formatterDatoTilISO(dokument.oppholdUtlandTom),
          },
          oppholdslandKoder: dokument.oppholdsland,
          sammeAdresseSomArbeidsgiver: dokument.sammeAdresseSomArbeidsgiver,
          ektefelleEllerBarnINorge: dokument.ektefelleEllerBarnINorge,
          forutgaendeBostedINorge: dokument.forutgaendeBostedINorge,
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
          utenlandskIdent: dokument.utenlandskIdent,
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
