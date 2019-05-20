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
      const { soknadsperiode } = action.data;

      const soknad = {
        ...state.data.soeknadDokument,
        periode: {
          fom: soknadsperiode.fom,
          tom: soknadsperiode.tom,
        },
      };

      return { ...state, data: { ...state.data, soeknadDokument: soknad } };
    }
    case Types.OPPDATER_SOKNAD: {
      const { dokument } = action;

      const soknad = {
        ...state.data.soeknadDokument,
        arbeidsinntekt: {
          inntektNorskIPerioden: strengTilInt(dokument.inntektNorskIPerioden),
          inntektUtenlandskIPerioden: strengTilInt(dokument.inntektUtenlandskIPerioden),
          inntektNaeringIPerioden: strengTilInt(dokument.inntektNaeringIPerioden),
          inntektNaturalytelser: {
            friBil: dokument.inntektNaturalFribil,
            friBolig: dokument.inntektNaturalFribolig,
            friAnnet: dokument.inntektNaturalIAnnet || null,
          },
          inntektErInnrapporteringspliktig: dokument.inntektErInnrapporteringspliktig,
          inntektTrygdeavgiftBlirTrukket: dokument.inntektTrygdeavgiftBlirTrukket,
        },
        arbeidNorge: {
          ...state.data.soeknadDokument.arbeidNorge,
          fullmektigFirma: dokument.fullmektigFirma,
          fullmektigGateadresse: dokument.fullmektigGateadresse,
          fullmektigPostnr: dokument.fullmektigPostnr,
          fullmektigPoststed: dokument.fullmektigPoststed,
          fullmektigRegion: dokument.fullmektigRegion,
          fullmektigLandkode: dokument.fullmektigLand,
        },
        arbeidUtland: dokument.arbeidUtland,
        juridiskArbeidsgiverNorge: {
          antallAnsatte: dokument.antallAnsatte,
          utsendteNeste12Mnd: dokument.utsendteNeste12Mnd,
          antallAdmAnsatte: dokument.antallAdmAnsatte,
          andelOmsetningINorge: dokument.andelOmsetningINorge,
          andelOppdragINorge: dokument.andelOppdragINorge,
          andelKontrakterINorge: dokument.andelKontrakterINorge,
          arbeidstakereRekruttertILand: dokument.arbeidstakereRekruttertILand || null,
          oppdragsKontrakterIHovedsakInngaattILand: dokument.oppdragsKontrakterIHovedsakInngaattILand || null,
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
            fom: dokument.oppholdUtlandFom ? formatterDatoTilISO(dokument.oppholdUtlandFom) : null,
            tom: dokument.oppholdUtlandTom ? formatterDatoTilISO(dokument.oppholdUtlandTom) : null,
          },
          oppholdslandkoder: dokument.oppholdsland,
          sammeAdresseSomArbeidsgiver: dokument.sammeAdresseSomArbeidsgiver,
          ektefelleEllerBarnINorge: null,
          forutgaendeBostedINorge: dokument.forutgaendeBostedINorge,
          studentSemester: null,
          studentFinansieringKode: null,
        },
        foretakUtland: dokument.foretakUtland.filter(foretakUtland => (
          foretakUtland.navn
          && foretakUtland.orgnr
          && foretakUtland.adresse
        )),
        bosted: {
          intensjonOmRetur: null,
          familiesBostedLandkode: dokument.familiesBosted,
          antallMaanederINorge: null,
          EOSBarnetrygdFraNAV: dokument.EOSBarnetrygdFraNAV,
          adresseIUtlandet: dokument.adresseIUtlandet,
          oppgittAdresse: {
            gatenavn: dokument.oppgittAdresseGatenavn,
            husnummer: dokument.oppgittAdresseHusnummer,
            region: dokument.oppgittAdresseRegion,
            postnummer: dokument.oppgittAdressePostnummer,
            poststed: dokument.oppgittAdressePoststed,
            landkode: dokument.oppgittAdresseLand,
          },
        },
        maritimtArbeid: dokument.maritimtArbeid.map(maritimtArbeid => ({
          navn: maritimtArbeid.navn || undefined,
          fartsomradeKode: maritimtArbeid.fartsomradeKode || null,
          flaggLandkode: maritimtArbeid.flaggLandkode || null,
          installasjonsLandkode: maritimtArbeid.installasjonsLandkode || null,
          territorialfarvann: maritimtArbeid.territorialfarvann || null,
        })),
        soeknadsland: {
          landkoder: dokument.soknadsland,
        },
        periode: {
          fom: dokument.soknadsperiodeFom ? formatterDatoTilISO(dokument.soknadsperiodeFom) : null,
          tom: dokument.soknadsperiodeTom ? formatterDatoTilISO(dokument.soknadsperiodeTom) : null,
        },
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
