export type TheArbeidsgiverbekrefterutsendelseSchema = boolean | null;
export type TheArbeidstakeransattunderutsendelsenSchema = boolean | null;
export type TheErstatterarbeidstakerenutsendteSchema = boolean | null;
export type TheArbeidstakertidligereutsendt24MndSchema = boolean | null;
export type TheArbeidsgiverbetalerarbeidsgiveravgiftSchema = boolean | null;
export type TheTrygdeavgifttrukketgjennomskattSchema = boolean | null;
export type TheLoennOgGodtgjoerelseSchema = {
  norskArbgUtbetalerLoenn: TheNorskArbgUtbetalerLoennSchema;
  erArbeidstakerAnsattHelePerioden: TheErArbeidstakerAnsattHelePeriodenSchema;
  utlArbgUtbetalerLoenn: TheUtlArbgUtbetalerLoennSchema;
  bruttoLoennPerMnd: TheBruttoLoennPerMndSchema;
  bruttoLoennUtlandPerMnd: TheBruttoLoennUtlandPerMndSchema;
  mottarNaturalytelser: TheMottarNaturalytelserSchema;
  samletVerdiNaturalytelser: TheSamletVerdiNaturalytelserSchema;
  erArbeidsgiveravgiftHelePerioden: TheErArbeidsgiveravgiftHelePeriodenSchema;
  erTrukketTrygdeavgift: TheErTrukketTrygdeavgiftSchema;
  utlArbTilhoererSammeKonsern: TheUtlArbTilhoererSammeKonsernSchema;
} | null;
export type TheNorskArbgUtbetalerLoennSchema = boolean | null;
export type TheErArbeidstakerAnsattHelePeriodenSchema = boolean | null;
export type TheUtlArbgUtbetalerLoennSchema = boolean | null;
export type TheBruttoLoennPerMndSchema = number | null;
export type TheBruttoLoennUtlandPerMndSchema = number | null;
export type TheMottarNaturalytelserSchema = boolean | null;
export type TheSamletVerdiNaturalytelserSchema = number | null;
export type TheErArbeidsgiveravgiftHelePeriodenSchema = boolean | null;
export type TheErTrukketTrygdeavgiftSchema = boolean | null;
export type TheUtlArbTilhoererSammeKonsernSchema = boolean | null;
export type TheIdSchema = string | null;
export type TheLandkodeSchema = string;
export type TheUtenlandskIdentSchema = TheItemsSchema[];
export type TheMedfolgendeBarnSchema = {
  uuid: string;
  fnr: string | null;
  navn: string | null;
  relasjonsrolle: "BARN" | "EKTEFELLE_SAMBOER";
}[];
export type TheNavnSchema = string | null;
export type TheForetakutlandSchema = TheItemsSchema1[];
export type TheItemsSchema2 = string | null;
export type TheOppholdslandkoderSchema = TheItemsSchema2[];
export type TheEktefelleellerbarninorgeSchema = boolean | null;
export type TheStudentfinansieringkodeSchema = string | null;
export type TheStudentsemesterSchema = string | null;
export type TheIntensjonomreturSchema = boolean | null;
export type TheAntallmaanederinorgeSchema = number | null;
export type TheErselvstendigSchema = boolean | null;
export type TheOrgnrSchema = string | null;
export type TheFortsetteretterarbeidiutlandetSchema = boolean | null;
export type TheSelvstendigforetakSchema = TheItemsSchema3[];
export type TheEnhetNavnSchema = string | null;
export type TheFartsomradekodeSchema = string | null;
export type TheFlagglandkodeSchema = string | null;
export type TheTerritorialfarvannSchema = string | null;
export type TheInnretningstypeSchema = string | null;
export type TheMaritimtArbeidSchema = TheMaritimtarbeidSchema[];
export type TheHjemmebaseNavnSchema = string | null;
export type TheHjemmebaseLandSchema = string | null;
export type TheTypeFlyvningerSchema = "NASJONAL" | "INTERNASJONAL" | "BEGGE" | null;
export type TheLuftfartBaserSchema = TheLuftfartBaserItemSchema[];
export type TheAntalladmansatteSchema = number | null;
export type TheAntallAnsatteSchema = number | null;
export type TheAntallUtsendteSchema = number | null;
export type TheAndelomsetninginorgeSchema = number | null;
export type TheAndelOppdragINorgeSchema = number | null;
export type TheAndelkontrakterinorgeSchema = number | null;
export type TheAndelRekruttertINorgeSchema = number | null;
export type TheItemsSchema4 = string;
export type TheEkstraArbeidsgivereSchema = TheItemsSchema4[];
export type TheKodeSchema = string;
export type TheTermSchema = string | null;

export interface TheRootSchema {
  mottaksdato: string | null;
  data:
    | {
        arbeidsgiversBekreftelse: {
          arbeidsgiverBekrefterUtsendelse: TheArbeidsgiverbekrefterutsendelseSchema;
          arbeidstakerAnsattUnderUtsendelsen: TheArbeidstakeransattunderutsendelsenSchema;
          erstatterArbeidstakerenUtsendte: TheErstatterarbeidstakerenutsendteSchema;
          arbeidstakerTidligereUtsendt24Mnd: TheArbeidstakertidligereutsendt24MndSchema;
          arbeidsgiverBetalerArbeidsgiveravgift: TheArbeidsgiverbetalerarbeidsgiveravgiftSchema;
          trygdeavgiftTrukketGjennomSkatt: TheTrygdeavgifttrukketgjennomskattSchema;
          trygdeavgiftTrukketGjennomSkattDato: string | null;
        };
        loennOgGodtgjoerelse: TheLoennOgGodtgjoerelseSchema;
        personOpplysninger: ThePersonopplysningerSchema;
        arbeidPaaLand: {
          fysiskeArbeidssteder: {
            adresse: {
              tilleggsnavn: string | null;
              gatenavn: string | null;
              husnummerEtasjeLeilighet: string | null;
              postboks: string | null;
              region: string | null;
              postnummer: string | null;
              poststed: string | null;
              landkode: string | null;
            };
            virksomhetNavn: string | null;
          }[];
          erHjemmekontor: boolean | null;
          erFastArbeidssted: boolean | null;
        };
        foretakUtland: TheForetakutlandSchema;
        oppholdUtland: TheOppholdutlandSchema;
        bosted: TheBostedSchema;
        selvstendigArbeid: TheSelvstendigarbeidSchema;
        maritimtArbeid: TheMaritimtArbeidSchema;
        luftfartBaser: TheLuftfartBaserSchema;
        soeknadsland: TheSoeknadslandSchema;
        periode: PeriodeMedFomTom;
        juridiskArbeidsgiverNorge: TheJuridiskarbeidsgivernorgeSchema;
        arbeidssituasjonOgOevrig: {
          harLoennetArbeidMinstEnMndFoerUtsending: boolean | null;
          beskrivelseArbeidSisteMnd: string | null;
          harAndreArbeidsgivereIUtsendingsperioden: boolean | null;
          beskrivelseAnnetArbeid: string | null;
          erSkattepliktig: boolean | null;
          mottarYtelserNorge: boolean | null;
          mottarYtelserUtlandet: boolean | null;
        };
        utenlandsoppdraget: {
          erUtsendelseForOppdragIUtlandet: boolean | null;
          erAnsattForOppdragIUtlandet: boolean | null;
          erFortsattAnsattEtterOppdraget: boolean | null;
          erDrattPaaEgetInitiativ: boolean | null;
          erErstatningTidligereUtsendte: boolean | null;
          samletUtsendingsperiode: PeriodeMedFomTom1;
        } | null;
      }
    | {
        juridiskArbeidsgiverNorge: TheJuridiskarbeidsgivernorgeSchema;
        personOpplysninger: ThePersonopplysningerSchema;
        arbeidPaaLand: {
          fysiskeArbeidssteder: {
            adresse: {
              tilleggsnavn: string | null;
              gatenavn: string | null;
              husnummerEtasjeLeilighet: string | null;
              postboks: string | null;
              region: string | null;
              postnummer: string | null;
              poststed: string | null;
              landkode: string | null;
            };
            virksomhetNavn: string | null;
          }[];
          erHjemmekontor: boolean | null;
          erFastArbeidssted: boolean | null;
        };
        foretakUtland: TheForetakutlandSchema;
        oppholdUtland: TheOppholdutlandSchema;
        bosted: TheBostedSchema;
        selvstendigArbeid: TheSelvstendigarbeidSchema;
        maritimtArbeid: TheMaritimtArbeidSchema;
        luftfartBaser: TheLuftfartBaserSchema;
        soeknadsland: TheSoeknadslandSchema;
        periode: PeriodeMedFomTom;
        overgangsregelbestemmelser: (TheKodeverkSchema | string)[];
        ytterligereInformasjon: string | null;
      }
    | {
        arbeidsgiversBekreftelse: {
          arbeidsgiverBekrefterUtsendelse: TheArbeidsgiverbekrefterutsendelseSchema;
          arbeidstakerAnsattUnderUtsendelsen: TheArbeidstakeransattunderutsendelsenSchema;
          erstatterArbeidstakerenUtsendte: TheErstatterarbeidstakerenutsendteSchema;
          arbeidstakerTidligereUtsendt24Mnd: TheArbeidstakertidligereutsendt24MndSchema;
          arbeidsgiverBetalerArbeidsgiveravgift: TheArbeidsgiverbetalerarbeidsgiveravgiftSchema;
          trygdeavgiftTrukketGjennomSkatt: TheTrygdeavgifttrukketgjennomskattSchema;
          trygdeavgiftTrukketGjennomSkattDato: string | null;
        };
        loennOgGodtgjoerelse: TheLoennOgGodtgjoerelseSchema;
        personOpplysninger: ThePersonopplysningerSchema;
        arbeidPaaLand: {
          fysiskeArbeidssteder: {
            adresse: {
              tilleggsnavn: string | null;
              gatenavn: string | null;
              husnummerEtasjeLeilighet: string | null;
              postboks: string | null;
              region: string | null;
              postnummer: string | null;
              poststed: string | null;
              landkode: string | null;
            };
            virksomhetNavn: string | null;
          }[];
          erHjemmekontor: boolean | null;
          erFastArbeidssted: boolean | null;
        };
        foretakUtland: TheForetakutlandSchema;
        oppholdUtland: TheOppholdutlandSchema;
        bosted: TheBostedSchema;
        selvstendigArbeid: TheSelvstendigarbeidSchema;
        maritimtArbeid: TheMaritimtArbeidSchema;
        luftfartBaser: TheLuftfartBaserSchema;
        soeknadsland: TheSoeknadslandSchema;
        periode: PeriodeMedFomTom;
        juridiskArbeidsgiverNorge: TheJuridiskarbeidsgivernorgeSchema;
        trygdedekning:
          | (
              | "UTEN_DEKNING"
              | "FULL_DEKNING_EOSFO"
              | "HELSEDEL"
              | "HELSEDEL_MED_SYKE_OG_FORELDREPENGER"
              | "PENSJONSDEL"
              | "HELSE_OG_PENSJONSDEL"
              | "HELSE_OG_PENSJONSDEL_MED_SYKE_OG_FORELDREPENGER"
              | "FULL_DEKNING_FTRL"
            )
          | null;
      };
  type: string;
}
export interface ThePersonopplysningerSchema {
  utenlandskIdent: TheUtenlandskIdentSchema;
  medfolgendeFamilie: TheMedfolgendeBarnSchema;
}
export interface TheItemsSchema {
  ident: TheIdSchema;
  landkode: TheLandkodeSchema;
}
export interface TheItemsSchema1 {
  uuid: string;
  navn: TheNavnSchema;
  orgnr: string | null;
  selvstendigNaeringsvirksomhet: boolean;
  adresse: {
    tilleggsnavn: string | null;
    gatenavn: string | null;
    husnummerEtasjeLeilighet: string | null;
    postboks: string | null;
    region: string | null;
    postnummer: string | null;
    poststed: string | null;
    landkode: string | null;
  };
}
export interface TheOppholdutlandSchema {
  oppholdslandkoder: TheOppholdslandkoderSchema;
  oppholdsPeriode: TheOppholdsperiodeSchema;
  ektefelleEllerBarnINorge: TheEktefelleellerbarninorgeSchema;
  studentFinansieringKode: TheStudentfinansieringkodeSchema;
  studentSemester: TheStudentsemesterSchema;
}
export interface TheOppholdsperiodeSchema {
  fom: string;
  tom: string | null;
}
export interface TheBostedSchema {
  intensjonOmRetur: TheIntensjonomreturSchema;
  antallMaanederINorge: TheAntallmaanederinorgeSchema;
  oppgittAdresse: {
    tilleggsnavn: string | null;
    gatenavn: string | null;
    husnummerEtasjeLeilighet: string | null;
    postboks: string | null;
    region: string | null;
    postnummer: string | null;
    poststed: string | null;
    landkode: string | null;
  };
}
export interface TheSelvstendigarbeidSchema {
  erSelvstendig: TheErselvstendigSchema;
  selvstendigForetak: TheSelvstendigforetakSchema;
}
export interface TheItemsSchema3 {
  orgnr: TheOrgnrSchema;
  fortsetterEtterArbeidIUtlandet: TheFortsetteretterarbeidiutlandetSchema;
}
export interface TheMaritimtarbeidSchema {
  enhetNavn: TheEnhetNavnSchema;
  fartsomradeKode: TheFartsomradekodeSchema;
  flaggLandkode: TheFlagglandkodeSchema;
  innretningLandkode: string | null;
  territorialfarvann: TheTerritorialfarvannSchema;
  innretningstype: TheInnretningstypeSchema;
}
export interface TheLuftfartBaserItemSchema {
  hjemmebaseNavn: TheHjemmebaseNavnSchema;
  hjemmebaseLand: TheHjemmebaseLandSchema;
  typeFlyvninger: TheTypeFlyvningerSchema;
}
export interface TheSoeknadslandSchema {
  landkoder: string[];
  erUkjenteEllerAlleEosLand: boolean;
}
export interface PeriodeMedFomTom {
  fom: string;
  tom: string | null;
}
export interface TheJuridiskarbeidsgivernorgeSchema {
  antallAdmAnsatte: TheAntalladmansatteSchema;
  antallAnsatte: TheAntallAnsatteSchema;
  antallUtsendte: TheAntallUtsendteSchema;
  andelOmsetningINorge: TheAndelomsetninginorgeSchema;
  andelOppdragINorge: TheAndelOppdragINorgeSchema;
  andelKontrakterINorge: TheAndelkontrakterinorgeSchema;
  andelRekruttertINorge: TheAndelRekruttertINorgeSchema;
  ekstraArbeidsgivere: TheEkstraArbeidsgivereSchema;
  erOffentligVirksomhet: boolean | null;
}
export interface PeriodeMedFomTom1 {
  fom: string | null;
  tom: string | null;
}
export interface TheKodeverkSchema {
  kode: TheKodeSchema;
  term: TheTermSchema;
}
