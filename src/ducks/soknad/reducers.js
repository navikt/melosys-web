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
      const { behandlingID, soeknadDokument } = soknadData;

      return {
        ...state,
        status: STATUS.OK,
        data: {
          behandlingID,
          soeknadDokument,
        },
      };
    }
    case Types.RESET:
      return { ...initialState };
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
          antallAnsatte: dokument.antallAnsatte,
          utsendteNeste12Mnd: dokument.utsendteNeste12Mnd,
          antallAdmAnsatte: dokument.antallAdmAnsatte,
          andelOmsetningINorge: dokument.andelOmsetningINorge,
          andelOppdragINorge: dokument.andelOppdragINorge,
          andelKontrakterINorge: dokument.andelKontrakterINorge,
          arbeidstakereRekruttert: dokument.arbeidstakereRekruttert,
          oppdragsKontrakterIHovedsakInngaattILand: dokument.oppdragsKontrakterIHovedsakInngaattILand,
          ekstraArbeidsgivere: dokument.ekstraArbeidsgivere || [],
        },
        arbeidsgiversBekreftelse: {
          ...state.data.soeknadDokument.arbeidsgiversBekreftelse,
          arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
          arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
          erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
          arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
          arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
          trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
          trygdeavgiftTrukketGjennomSkattDato: dokument.trygdeavgiftTrukketGjennomSkattDato ? formatterDatoTilISO(dokument.trygdeavgiftTrukketGjennomSkattDato) : null,
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
            husnummer: dokument.oppgittAdresseHusnummer,
            region: dokument.oppgittAdresseRegion,
            postnummer: dokument.oppgittAdressePostnummer,
            poststed: dokument.oppgittAdressePoststed,
            landKode: dokument.oppgittAdresseLand,
          },
        },
        maritimtArbeid: dokument.maritimtArbeid,
        selvstendigArbeid: {
          erSelvstendig: dokument.erSelvstendig,
          selvstendigForetak: dokument.selvstendigForetak,
        },
        personOpplysninger: {
          utenlandskIdent: dokument.utenlandskIdent,
          medfolgendeFamilie: [],
          medfolgendeAndre: null,
        },
      };

      return { ...state, data: { ...state.data, soeknadDokument: soknad } };
    }
    default:
      return state;
  }
}
