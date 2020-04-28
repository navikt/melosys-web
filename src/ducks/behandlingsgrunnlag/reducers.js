import { STATUS } from '../../services/utils';

import * as Types from './types';

import { strengTilInt } from '../../utils/streng';
import { formatterDatoTilISO } from '../../utils/dato';
import * as Utils from '../../utils';

const lagNullableAdresse = adresse => {
  if (Utils._isNil(adresse)) {
    return {
      gatenavn: null,
      husnummer: null,
      region: null,
      postnummer: null,
      poststed: null,
      landkode: null,
    };
  }
  return {
    gatenavn: adresse.gatenavn || null,
    husnummer: adresse.husnummer || null,
    region: adresse.region || null,
    postnummer: adresse.postnummer || null,
    poststed: adresse.poststed || null,
    landkode: adresse.landkode || null,
  };
};

export const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case Types.PENDING:
      return { ...state, status: STATUS.PENDING };
    case Types.FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case Types.OK: {
      return {
        ...state,
        status: STATUS.OK,
        data: {
          ...action.data,
        },
      };
    }
    case Types.RESET:
      return { ...initialState };
    case Types.OPPDATER_PERIODE: {
      const { periode } = action.data;

      return {
        ...state,
        data: {
          ...state.data,
          data: {
            ...state.data.data,
            periode: {
              fom: periode.fom,
              tom: periode.tom,
            },
          },
        },
      };
    }
    case Types.OPPDATER_BEHANDLINGSGRUNNLAG: {
      const { dokument } = action;

      const data = {
        ...state.data,
        data: {
          arbeidsinntekt: {
            inntektNorskIPerioden: dokument.inntektNorskIPerioden ? strengTilInt(dokument.inntektNorskIPerioden) : null,
            inntektUtenlandskIPerioden: dokument.inntektUtenlandskIPerioden ? strengTilInt(dokument.inntektUtenlandskIPerioden) : null,
            inntektNaeringIPerioden: null,
            inntektNaturalytelser: {
              friBil: dokument.inntektNaturalFribil,
              friBolig: dokument.inntektNaturalFribolig,
              friAnnet: dokument.inntektNaturalIAnnet || null,
            },
            inntektErInnrapporteringspliktig: dokument.inntektErInnrapporteringspliktig,
            inntektTrygdeavgiftBlirTrukket: dokument.inntektTrygdeavgiftBlirTrukket,
          },
          arbeidNorge: {
            ...state.data.data.arbeidNorge,
            fullmektigFirma: dokument.fullmektigFirma,
            fullmektigGateadresse: dokument.fullmektigGateadresse,
            fullmektigPostnr: dokument.fullmektigPostnr,
            fullmektigPoststed: dokument.fullmektigPoststed,
            fullmektigRegion: dokument.fullmektigRegion,
            fullmektigLandkode: dokument.fullmektigLand,
          },
          arbeidUtland: dokument.arbeidUtland.map(arbeidUtland => ({
            adresse: {
              gatenavn: arbeidUtland.adresse.gatenavn,
              husnummer: arbeidUtland.adresse.husnummer || null,
              landkode: arbeidUtland.adresse.landkode,
              postnummer: arbeidUtland.adresse.postnummer,
              poststed: arbeidUtland.adresse.poststed,
              region: arbeidUtland.adresse.region || null,
            },
            foretakNavn: arbeidUtland.foretakNavn || null,
            foretakOrgnr: arbeidUtland.foretakOrgnr || null,
            arbeidUtlandHjemmekontor: Utils._isNil(arbeidUtland.arbeidUtlandHjemmekontor) ? null : arbeidUtland.arbeidUtlandHjemmekontor,
          })),
          juridiskArbeidsgiverNorge: {
            antallAnsatte: dokument.antallAnsatte ? strengTilInt(dokument.antallAnsatte) : null,
            utsendteNeste12Mnd: dokument.utsendteNeste12Mnd ? strengTilInt(dokument.utsendteNeste12Mnd) : null,
            antallAdmAnsatte: dokument.antallAdmAnsatte ? strengTilInt(dokument.antallAdmAnsatte) : null,
            andelOmsetningINorge: dokument.andelOmsetningINorge ? strengTilInt(dokument.andelOmsetningINorge) : null,
            andelOppdragINorge: dokument.andelOppdragINorge ? strengTilInt(dokument.andelOppdragINorge) : null,
            andelKontrakterINorge: dokument.andelKontrakterINorge ? strengTilInt(dokument.andelKontrakterINorge) : null,
            arbeidstakereRekruttertILand: dokument.arbeidstakereRekruttertILand || null,
            oppdragsKontrakterIHovedsakInngaattILand: null,
            ekstraArbeidsgivere: dokument.ekstraArbeidsgivere || [],
          },
          arbeidsgiversBekreftelse: {
            arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
            arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
            erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
            arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
            arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
            trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
            trygdeavgiftTrukketGjennomSkattDato: dokument.trygdeavgiftTrukketGjennomSkattDato ? formatterDatoTilISO(dokument.trygdeavgiftTrukketGjennomSkattDato) : null,
          },
          oppholdUtland: {
            oppholdsPeriode: {
              fom: dokument.oppholdUtlandFom ? formatterDatoTilISO(dokument.oppholdUtlandFom) : null,
              tom: dokument.oppholdUtlandTom ? formatterDatoTilISO(dokument.oppholdUtlandTom) : null,
            },
            oppholdslandkoder: dokument.oppholdsland,
            ektefelleEllerBarnINorge: null,
            studentSemester: null,
            studentFinansieringKode: null,
          },
          foretakUtland: dokument.foretakUtland.map(foretakUtland => ({
            uuid: foretakUtland.uuid,
            navn: foretakUtland.navn || null,
            orgnr: foretakUtland.orgnr || null,
            selvstendigNaeringsvirksomhet: foretakUtland.selvstendigNaeringsvirksomhet || false,
            adresse: lagNullableAdresse(foretakUtland.adresse),
          })),
          bosted: {
            intensjonOmRetur: null,
            antallMaanederINorge: null,
            EOSBarnetrygdFraNAV: dokument.EOSBarnetrygdFraNAV,
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
            enhetNavn: maritimtArbeid.enhetNavn || null,
            fartsomradeKode: maritimtArbeid.fartsomradeKode || null,
            flaggLandkode: maritimtArbeid.flaggLandkode || null,
            installasjonsLandkode: maritimtArbeid.installasjonsLandkode || null,
            territorialfarvann: maritimtArbeid.territorialfarvann || null,
            foretakNavn: maritimtArbeid.foretakNavn || null,
            foretakOrgnr: maritimtArbeid.foretakOrgnr || null,
          })),
          soeknadsland: {
            landkoder: dokument.soknadsland,
          },
          periode: {
            fom: dokument.soknadsperiodeFom ? formatterDatoTilISO(dokument.soknadsperiodeFom) : null,
            tom: dokument.soknadsperiodeTom ? formatterDatoTilISO(dokument.soknadsperiodeTom) : null,
          },
          selvstendigArbeid: {
            erSelvstendig: Utils._isNil(dokument.erSelvstendig) ? null : dokument.erSelvstendig,
            selvstendigForetak: dokument.selvstendigForetak.map(foretak => ({
              orgnr: foretak.orgnr || null,
              fortsetterEtterArbeidIUtlandet: Utils._isNil(foretak.fortsetterEtterArbeidIUtlandet) ? null : foretak.fortsetterEtterArbeidIUtlandet,
            })),
          },
          personOpplysninger: {
            utenlandskIdent: dokument.utenlandskIdent,
            medfolgendeFamilie: [],
            medfolgendeAndre: null,
          },
          overgangsregelbestemmelser: dokument.overgangsregelbestemmelser || (state.data.data.overgangsregelbestemmelser || []),
          norskeArbeidsgivere: dokument.norskeArbeidsgivere || [],
          ytterligereInformasjon: state.data.data.ytterligereInformasjon,
        },
      };

      return { ...state, data: { ...data } };
    }
    default:
      return state;
  }
}
