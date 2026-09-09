import { STATUS } from "../../services";

import * as Types from "./types";

import { strengTilInt, tryParseFloat } from "../../utils/streng";
import { formatterDatoTilISO } from "../../utils/dato";
import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

const lagNullableStrukturertAdresse = (adresse) => {
  if (Utils._isNil(adresse)) {
    return {
      tilleggsnavn: null,
      gatenavn: null,
      husnummerEtasjeLeilighet: null,
      region: null,
      postboks: null,
      postnummer: null,
      poststed: null,
      landkode: null,
    };
  }
  return {
    tilleggsnavn: adresse.tilleggsnavn || null,
    gatenavn: adresse.gatenavn || null,
    husnummerEtasjeLeilighet: adresse.husnummerEtasjeLeilighet || null,
    region: adresse.region || null,
    postboks: adresse.postboks || null,
    postnummer: adresse.postnummer || null,
    poststed: adresse.poststed || null,
    landkode: adresse.landkode || null,
  };
};

export const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

export default function reducer(state = initialState, action = {}) {
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
              landkoder: action.data.soeknadsland.landkoder,
              flereLandUkjentHvilke: action.data.soeknadsland.flereLandUkjentHvilke,
            },
          },
        },
      };
    }
    case Types.OPPDATER_AVSENDERLAND: {
      return {
        ...state,
        data: {
          ...state.data,
          data: {
            ...state.data.data,
            avsenderland: action.data.avsenderland,
          },
        },
      };
    }
    case Types.OPPDATER_LOVVALGSLAND: {
      return {
        ...state,
        data: {
          ...state.data,
          data: {
            ...state.data.data,
            lovvalgsland: action.data.lovvalgsland,
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
    case Types.OPPDATER_IKKE_YRKESAKTIV_SITUASJONTYPE: {
      return {
        ...state,
        data: {
          ...state.data,
          data: {
            ...state.data.data,
            ikkeYrkesaktivSituasjontype: action.data.ikkeYrkesaktivSituasjontype,
          },
        },
      };
    }
    case Types.OPPDATER_MOTTATTE_OPPLYSNINGER: {
      const { dokument } = action;

      const foretakUtland = [
        ...dokument.arbeidsforholdUtland.map((forhold) => ({
          uuid: forhold.uuid,
          navn: forhold.navn || null,
          orgnr: forhold.orgnr || null,
          selvstendigNaeringsvirksomhet: false,
          adresse: lagNullableStrukturertAdresse(forhold.adresse),
        })),
        ...dokument.selvstendigNaeringsvirksomhetUtland.map((virksomhet) => ({
          uuid: virksomhet.uuid,
          navn: virksomhet.navn || null,
          orgnr: virksomhet.orgnr || null,
          selvstendigNaeringsvirksomhet: true,
          adresse: lagNullableStrukturertAdresse(virksomhet.adresse),
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
        yrke: arbeidsstedSkip.yrke || null,
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
                tilleggsnavn: arbeidPaaLand.adresse.tilleggsnavn || null,
                gatenavn: arbeidPaaLand.adresse.gatenavn || null,
                husnummerEtasjeLeilighet: arbeidPaaLand.adresse.husnummerEtasjeLeilighet || null,
                landkode: arbeidPaaLand.adresse.landkode || null,
                postboks: arbeidPaaLand.adresse.postboks || null,
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
            antallAnsatte: dokument.juridiskArbeidsgiverNorge.antallAnsatte
              ? strengTilInt(dokument.juridiskArbeidsgiverNorge.antallAnsatte)
              : null,
            antallAdmAnsatte: dokument.juridiskArbeidsgiverNorge.antallAdmAnsatte
              ? strengTilInt(dokument.juridiskArbeidsgiverNorge.antallAdmAnsatte)
              : null,
            antallUtsendte: dokument.juridiskArbeidsgiverNorge.antallUtsendte
              ? strengTilInt(dokument.juridiskArbeidsgiverNorge.antallUtsendte)
              : null,
            andelOmsetningINorge: dokument.juridiskArbeidsgiverNorge.andelOmsetningINorge
              ? tryParseFloat(dokument.juridiskArbeidsgiverNorge.andelOmsetningINorge)
              : null,
            andelOppdragINorge: dokument.juridiskArbeidsgiverNorge.andelOppdragINorge
              ? tryParseFloat(dokument.juridiskArbeidsgiverNorge.andelOppdragINorge)
              : null,
            andelKontrakterINorge: dokument.juridiskArbeidsgiverNorge.andelKontrakterINorge
              ? tryParseFloat(dokument.juridiskArbeidsgiverNorge.andelKontrakterINorge)
              : null,
            andelRekruttertINorge: dokument.juridiskArbeidsgiverNorge.andelRekruttertINorge
              ? tryParseFloat(dokument.juridiskArbeidsgiverNorge.andelRekruttertINorge)
              : null,
            ekstraArbeidsgivere:
              dokument.juridiskArbeidsgiverNorge.ekstraArbeidsgivere.filter((arbeidsgiver) => arbeidsgiver) || [],
            erOffentligVirksomhet: Utils._isNil(dokument.juridiskArbeidsgiverNorge.erOffentligVirksomhet)
              ? null
              : dokument.juridiskArbeidsgiverNorge.erOffentligVirksomhet,
          },
          arbeidsgiversBekreftelse: {
            arbeidsgiverBekrefterUtsendelse: dokument.arbeidsgiverBekrefterUtsendelse,
            arbeidstakerAnsattUnderUtsendelsen: dokument.arbeidstakerAnsattUnderUtsendelsen,
            erstatterArbeidstakerenUtsendte: dokument.erstatterArbeidstakerenUtsendte,
            arbeidstakerTidligereUtsendt24Mnd: dokument.arbeidstakerTidligereUtsendt24Mnd,
            arbeidsgiverBetalerArbeidsgiveravgift: dokument.arbeidsgiverBetalerArbeidsgiveravgift,
            trygdeavgiftTrukketGjennomSkatt: dokument.trygdeavgiftTrukketGjennomSkatt,
            trygdeavgiftTrukketGjennomSkattDato: formatterDatoTilISO(
              dokument.trygdeavgiftTrukketGjennomSkattDato,
              null,
            ),
          },
          oppholdUtland: {
            oppholdsPeriode: {
              fom: formatterDatoTilISO(dokument.oppholdUtlandFom, null),
              tom: formatterDatoTilISO(dokument.oppholdUtlandTom, null),
            },
            oppholdslandkoder: dokument.oppholdsland,
            ektefelleEllerBarnINorge: null,
            studentSemester: null,
            studentFinansieringKode: null,
          },
          foretakUtland,
          bosted: {
            intensjonOmRetur: null,
            antallMaanederINorge: dokument.antallMaanederINorge || 0,
            oppgittAdresse: {
              tilleggsnavn: dokument.oppgittAdresseTilleggsnavn,
              gatenavn: dokument.oppgittAdresseGatenavn,
              husnummerEtasjeLeilighet: dokument.oppgittAdresseHusnummerEtasjeLeilighet,
              region: dokument.oppgittAdresseRegion,
              postboks: dokument.oppgittAdressePostboks,
              postnummer: dokument.oppgittAdressePostnummer,
              poststed: dokument.oppgittAdressePoststed,
              landkode: dokument.oppgittAdresseLand,
            },
          },
          ikkeYrkesaktivSituasjontype: dokument.ikkeYrkesaktivSituasjontype,
          representantIUtlandet: Utils._isNil(dokument.representantIUtlandet)
            ? null
            : {
                representantNavn: dokument.representantIUtlandet.representantNavn,
                adresselinjer: dokument.representantIUtlandet.adresselinjer?.filter((al) => !Utils._isEmpty(al)) || [],
                representantLand: dokument.soknadsland.landkoder[0] || null,
              },
          maritimtArbeid,
          luftfartBaser: dokument.arbeidsstedFly.map((arbeidssted) => ({
            hjemmebaseNavn: arbeidssted.hjemmebaseNavn || null,
            hjemmebaseLand: arbeidssted.hjemmebaseLand || null,
            typeFlyvninger: arbeidssted.typeFlyvninger || null,
          })),
          soeknadsland: {
            landkoder: dokument.soknadsland.landkoder,
            flereLandUkjentHvilke: dokument.soknadsland.flereLandUkjentHvilke,
          },
          avsenderland: dokument.avsenderland,
          lovvalgsland: dokument.lovvalgsland,
          periode: {
            fom: formatterDatoTilISO(dokument.soknadsperiodeFom, null),
            tom: formatterDatoTilISO(dokument.soknadsperiodeTom, null),
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
          arbeidssituasjonOgOevrig: {
            harLoennetArbeidMinstEnMndFoerUtsending: Utils._isNil(
              dokument.arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending,
            )
              ? null
              : dokument.arbeidssituasjonOgOevrig.harLoennetArbeidMinstEnMndFoerUtsending,
            beskrivelseArbeidSisteMnd: dokument.arbeidssituasjonOgOevrig.beskrivelseArbeidSisteMnd,
            harAndreArbeidsgivereIUtsendingsperioden: Utils._isNil(
              dokument.arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden,
            )
              ? null
              : dokument.arbeidssituasjonOgOevrig.harAndreArbeidsgivereIUtsendingsperioden,
            beskrivelseAnnetArbeid: dokument.arbeidssituasjonOgOevrig.beskrivelseAnnetArbeid,
            erSkattepliktig: Utils._isNil(dokument.arbeidssituasjonOgOevrig.erSkattepliktig)
              ? null
              : dokument.arbeidssituasjonOgOevrig.erSkattepliktig,
            mottarYtelserNorge: Utils._isNil(dokument.arbeidssituasjonOgOevrig.mottarYtelserNorge)
              ? null
              : dokument.arbeidssituasjonOgOevrig.mottarYtelserNorge,
            mottarYtelserUtlandet: Utils._isNil(dokument.arbeidssituasjonOgOevrig.mottarYtelserUtlandet)
              ? null
              : dokument.arbeidssituasjonOgOevrig.mottarYtelserUtlandet,
          },
          utenlandsoppdraget: {
            erUtsendelseForOppdragIUtlandet: dokument.utenlandsoppdraget.erUtsendelseForOppdragIUtlandet,
            erAnsattForOppdragIUtlandet: dokument.utenlandsoppdraget.erAnsattForOppdragIUtlandet,
            erFortsattAnsattEtterOppdraget: dokument.utenlandsoppdraget.erFortsattAnsattEtterOppdraget,
            erDrattPaaEgetInitiativ: dokument.utenlandsoppdraget.erDrattPaaEgetInitiativ,
            erErstatningTidligereUtsendte: dokument.utenlandsoppdraget.erErstatningTidligereUtsendte,
            samletUtsendingsperiode: {
              fom: formatterDatoTilISO(dokument.utenlandsoppdraget.samletUtsendingsperiode.fom, null),
              tom: formatterDatoTilISO(dokument.utenlandsoppdraget.samletUtsendingsperiode.tom, null),
            },
          },
          personOpplysninger: {
            foedestedOgLand: dokument.foedestedOgLand,
            medfolgendeFamilie: [
              ...dokument.medfolgendeBarn
                .filter((enkeltBarn) => enkeltBarn.fnr && enkeltBarn.navn)
                .map((enkeltBarn) => ({
                  uuid: enkeltBarn.uuid,
                  navn: enkeltBarn.navn,
                  fnr: enkeltBarn.fnr,
                  relasjonsrolle: KV.Koder.Relasjonsrolle.BARN,
                })),
              ...dokument.medfolgendeEktefelleSamboer
                .filter((enkeltEktefelleSamboer) => enkeltEktefelleSamboer.fnr && enkeltEktefelleSamboer.navn)
                .map((enkeltEktefelleSamboer) => ({
                  uuid: enkeltEktefelleSamboer.uuid,
                  navn: enkeltEktefelleSamboer.navn,
                  fnr: enkeltEktefelleSamboer.fnr,
                  relasjonsrolle: KV.Koder.Relasjonsrolle.EKTEFELLE_SAMBOER,
                })),
            ],
          },
          overgangsregelbestemmelser: Utils._has(dokument, "overgangsregelbestemmelser")
            ? dokument.overgangsregelbestemmelser || state.data.data.overgangsregelbestemmelser || []
            : undefined,
          ytterligereInformasjon: Utils._has(dokument, "ytterligereInformasjon")
            ? state.data.data.ytterligereInformasjon || null
            : undefined,
          trygdedekning: dokument.trygdedekning,
        },
      };

      return { ...state, data: { ...data } };
    }
    default:
      return state;
  }
}
