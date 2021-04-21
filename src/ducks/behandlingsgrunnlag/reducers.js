import { STATUS } from "../../services/utils";

import * as Types from "./types";

import { strengTilInt, tryParseFloat } from "../../utils/streng";
import { formatterDatoTilISO } from "../../utils/dato";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

const lagNullableAdresse = (adresse) => {
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
    case Types.OPPDATER_SOEKNADSLAND: {
      return {
        ...state,
        data: {
          ...state.data,
          data: {
            ...state.data.data,
            soeknadsland: {
              landkoder: action.data.soeknadsland,
            },
          },
        },
      };
    }
    case Types.OPPDATER_TRYGDEDEKNING: {
      return {
        ...state,
        data: {
          ...state.data,
          data: {
            ...state.data.data,
            trygdedekning: action.data.trygdedekning,
          },
        },
      };
    }
    case Types.OPPDATER_BEHANDLINGSGRUNNLAG: {
      const { dokument } = action;

      const foretakUtland = [
        ...dokument.arbeidsforholdUtland.map((forhold) => ({
          uuid: forhold.uuid,
          navn: forhold.navn || null,
          orgnr: forhold.orgnr || null,
          selvstendigNaeringsvirksomhet: false,
          adresse: lagNullableAdresse(forhold.adresse),
        })),
        ...dokument.selvstendigNaeringsvirksomhetUtland.map((virksomhet) => ({
          uuid: virksomhet.uuid,
          navn: virksomhet.navn || null,
          orgnr: virksomhet.orgnr || null,
          selvstendigNaeringsvirksomhet: true,
          adresse: lagNullableAdresse(virksomhet.adresse),
        })),
      ];

      const lagMaritimtArbeidAvArbeidsstedOffshore = (arbeidsstedOffshore) => ({
        enhetNavn: arbeidsstedOffshore.enhetNavn || null,
        fartsomradeKode: null,
        flaggLandkode: null,
        /**
         * innretningLandkode brukes for å skille mellom offshore og skip - skip vil alltid ha null for innretningLandkode, offshore vil alltid ha en string.
         */
        innretningLandkode: arbeidsstedOffshore.innretningLandkode || "",
        territorialfarvann: null,
        innretningstype: arbeidsstedOffshore.innretningstype || null,
      });

      const lagMaritimtArbeidAvArbeidsstedSkip = (arbeidsstedSkip) => ({
        enhetNavn: arbeidsstedSkip.enhetNavn || null,
        fartsomradeKode: arbeidsstedSkip.fartsomradeKode || null,
        flaggLandkode: arbeidsstedSkip.flaggLandkode || null,
        innretningLandkode: null,
        territorialfarvann: arbeidsstedSkip.territorialfarvann || null,
        innretningstype: null,
      });

      const maritimtArbeid = [
        ...dokument.arbeidsstedOffshore.map(lagMaritimtArbeidAvArbeidsstedOffshore),
        ...dokument.arbeidsstedSkip.map(lagMaritimtArbeidAvArbeidsstedSkip),
      ];

      const data = {
        ...state.data,
        data: {
          arbeidPaaLand: {
            fysiskeArbeidssteder: dokument.arbeidPaaLand.fysiskeArbeidssteder.map((arbeidPaaLand) => ({
              adresse: {
                gatenavn: arbeidPaaLand.adresse.gatenavn || null,
                husnummer: arbeidPaaLand.adresse.husnummer || null,
                landkode: arbeidPaaLand.adresse.landkode || null,
                postnummer: arbeidPaaLand.adresse.postnummer || null,
                poststed: arbeidPaaLand.adresse.poststed || null,
                region: arbeidPaaLand.adresse.region || null,
              },
              virksomhetNavn: arbeidPaaLand.virksomhetNavn,
            })),
            erHjemmekontor: Utils._isNil(dokument.arbeidPaaLand.erHjemmekontor)
              ? null
              : dokument.arbeidPaaLand.erHjemmekontor,
            erFastArbeidssted: Utils._isNil(dokument.arbeidPaaLand.erFastArbeidssted)
              ? null
              : dokument.arbeidPaaLand.erFastArbeidssted,
          },
          juridiskArbeidsgiverNorge: {
            antallAnsatte: dokument.antallAnsatte ? strengTilInt(dokument.antallAnsatte) : null,
            antallAdmAnsatte: dokument.antallAdmAnsatte ? strengTilInt(dokument.antallAdmAnsatte) : null,
            antallUtsendte: dokument.antallUtsendte ? strengTilInt(dokument.antallUtsendte) : null,
            andelOmsetningINorge: dokument.andelOmsetningINorge ? strengTilInt(dokument.andelOmsetningINorge) : null,
            andelOppdragINorge: dokument.andelOppdragINorge ? strengTilInt(dokument.andelOppdragINorge) : null,
            andelKontrakterINorge: dokument.andelKontrakterINorge ? strengTilInt(dokument.andelKontrakterINorge) : null,
            andelRekruttertINorge: dokument.andelRekruttertINorge ? strengTilInt(dokument.andelRekruttertINorge) : null,
            ekstraArbeidsgivere: dokument.ekstraArbeidsgivere.filter((arbeidsgiver) => arbeidsgiver) || [],
          },
          arbeidsgiversBekreftelse: {
            arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
            arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
            erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
            arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
            arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
            trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
            trygdeavgiftTrukketGjennomSkattDato: dokument.trygdeavgiftTrukketGjennomSkattDato
              ? formatterDatoTilISO(dokument.trygdeavgiftTrukketGjennomSkattDato)
              : null,
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
          foretakUtland,
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
          maritimtArbeid,
          luftfartBaser: dokument.arbeidsstedFly.map((arbeidssted) => ({
            hjemmebaseNavn: arbeidssted.hjemmebaseNavn || null,
            hjemmebaseLand: arbeidssted.hjemmebaseLand || null,
            typeFlyvninger: arbeidssted.typeFlyvninger || null,
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
            selvstendigForetak: dokument.selvstendigForetak.map((foretak) => ({
              orgnr: foretak.orgnr || null,
              fortsetterEtterArbeidIUtlandet: Utils._isNil(foretak.fortsetterEtterArbeidIUtlandet)
                ? null
                : foretak.fortsetterEtterArbeidIUtlandet,
            })),
          },
          loennOgGodtgjoerelse: {
            norskArbgUtbetalerLoenn: dokument.loennOgGodtgjoerelse.norskArbgUtbetalerLoenn,
            erArbeidstakerAnsattHelePerioden: dokument.loennOgGodtgjoerelse.erArbeidstakerAnsattHelePerioden,
            utlArbgUtbetalerLoenn: dokument.loennOgGodtgjoerelse.utlArbgUtbetalerLoenn,
            bruttoLoennPerMnd: tryParseFloat(dokument.loennOgGodtgjoerelse.bruttoLoennPerMnd),
            bruttoLoennUtlandPerMnd: tryParseFloat(dokument.loennOgGodtgjoerelse.bruttoLoennUtlandPerMnd),
            mottarNaturalytelser: dokument.loennOgGodtgjoerelse.mottarNaturalytelser,
            samletVerdiNaturalytelser: tryParseFloat(dokument.loennOgGodtgjoerelse.samletVerdiNaturalytelser),
            utlArbTilhoererSammeKonsern: dokument.loennOgGodtgjoerelse.utlArbTilhoererSammeKonsern,
            erArbeidsgiveravgiftHelePerioden: dokument.loennOgGodtgjoerelse.erArbeidsgiveravgiftHelePerioden,
            erTrukketTrygdeavgift: dokument.loennOgGodtgjoerelse.erTrukketTrygdeavgift,
          },
          oevrigOmArbeidstaker: {
            harLoennetArbeidMinstEnMndFoerUtsending: Utils._isNil(
              dokument.oevrigOmArbeidstaker.harLoennetArbeidMinstEnMndFoerUtsending
            )
              ? null
              : dokument.oevrigOmArbeidstaker.harLoennetArbeidMinstEnMndFoerUtsending,
            beskrivelseArbeidSisteMnd: dokument.oevrigOmArbeidstaker.beskrivelseArbeidSisteMnd,
            harAndreArbeidsgivereIUtsendingsperioden: Utils._isNil(
              dokument.oevrigOmArbeidstaker.harAndreArbeidsgivereIUtsendingsperioden
            )
              ? null
              : dokument.oevrigOmArbeidstaker.harAndreArbeidsgivereIUtsendingsperioden,
            beskrivelseAnnetArbeid: dokument.oevrigOmArbeidstaker.beskrivelseAnnetArbeid,
            erSkattepliktig: Utils._isNil(dokument.oevrigOmArbeidstaker.erSkattepliktig)
              ? null
              : dokument.oevrigOmArbeidstaker.erSkattepliktig,
            mottarYtelserNorge: Utils._isNil(dokument.oevrigOmArbeidstaker.mottarYtelserNorge)
              ? null
              : dokument.oevrigOmArbeidstaker.mottarYtelserNorge,
            mottarYtelserUtlandet: Utils._isNil(dokument.oevrigOmArbeidstaker.mottarYtelserUtlandet)
              ? null
              : dokument.oevrigOmArbeidstaker.mottarYtelserUtlandet,
          },
          personOpplysninger: {
            utenlandskIdent: dokument.utenlandskIdent,
            medfolgendeFamilie: [
              ...dokument.medfolgendeBarn.map((enkeltBarn) => ({
                uuid: enkeltBarn.uuid,
                navn: enkeltBarn.navn,
                fnr: enkeltBarn.fnr,
                relasjonsrolle: KV.Koder.Relasjonsrolle.BARN,
              })),
              ...dokument.medfolgendeEktefelleSamboer.map((enkeltEktefelleSamboer) => ({
                uuid: enkeltEktefelleSamboer.uuid,
                navn: enkeltEktefelleSamboer.navn,
                fnr: enkeltEktefelleSamboer.fnr,
                relasjonsrolle: KV.Koder.Relasjonsrolle.EKTEFELLE_SAMBOER,
              })),
            ],
          },
          overgangsregelbestemmelser:
            dokument.overgangsregelbestemmelser || state.data.data.overgangsregelbestemmelser || [],
          ytterligereInformasjon: state.data.data.ytterligereInformasjon || null,
          trygdedekning: dokument.trygdedekning,
        },
      };

      return { ...state, data: { ...data } };
    }
    default:
      return state;
  }
}
