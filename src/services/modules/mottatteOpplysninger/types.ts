type Arbeidsgiverbekrefterutsendelse = boolean | null;
type Arbeidstakeransattunderutsendelsen = boolean | null;
type Erstatterarbeidstakerenutsendte = boolean | null;
type Arbeidstakertidligereutsendt24Mnd = boolean | null;
type Arbeidsgiverbetalerarbeidsgiveravgift = boolean | null;
type Trygdeavgifttrukketgjennomskatt = boolean | null;
type LoennOgGodtgjoerelse = {
  norskArbgUtbetalerLoenn: NorskArbgUtbetalerLoenn;
  erArbeidstakerAnsattHelePerioden: ErArbeidstakerAnsattHelePerioden;
  utlArbgUtbetalerLoenn: UtlArbgUtbetalerLoenn;
  bruttoLoennPerMnd: BruttoLoennPerMnd;
  bruttoLoennUtlandPerMnd: BruttoLoennUtlandPerMnd;
  mottarNaturalytelser: MottarNaturalytelser;
  samletVerdiNaturalytelser: SamletVerdiNaturalytelser;
  erArbeidsgiveravgiftHelePerioden: ErArbeidsgiveravgiftHelePerioden;
  erTrukketTrygdeavgift: ErTrukketTrygdeavgift;
  utlArbTilhoererSammeKonsern: UtlArbTilhoererSammeKonsern;
} | null;
type NorskArbgUtbetalerLoenn = boolean | null;
type ErArbeidstakerAnsattHelePerioden = boolean | null;
type UtlArbgUtbetalerLoenn = boolean | null;
type BruttoLoennPerMnd = number | null;
type BruttoLoennUtlandPerMnd = number | null;
type MottarNaturalytelser = boolean | null;
type SamletVerdiNaturalytelser = number | null;
type ErArbeidsgiveravgiftHelePerioden = boolean | null;
type ErTrukketTrygdeavgift = boolean | null;
type UtlArbTilhoererSammeKonsern = boolean | null;
type Id = string | null;
type Landkode = string;
type UtenlandskIdent = {
  ident: Id;
  landkode: Landkode;
};
type MedfolgendeBarn = {
  uuid: string;
  fnr: string | null;
  navn: string | null;
  relasjonsrolle: "BARN" | "EKTEFELLE_SAMBOER";
}[];
type FoedestedOgLand = {
  foedested: string;
  foedeland: Landkode;
};
type Navn = string | null;
type Foretakutland = {
  uuid: string;
  navn: Navn;
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
};

type Oppholdslandkode = string | null;
type Ektefelleellerbarninorge = boolean | null;
type Studentfinansieringkode = string | null;
type Studentsemester = string | null;
type Intensjonomretur = boolean | null;
type Antallmaanederinorge = number | null;
type Erselvstendig = boolean | null;
type Orgnr = string | null;
type Fortsetteretterarbeidiutlandet = boolean | null;
type Selvstendigforetak = {
  orgnr: Orgnr;
  fortsetterEtterArbeidIUtlandet: Fortsetteretterarbeidiutlandet;
};
type EnhetNavn = string | null;
type Fartsomradekode = string | null;
type Flagglandkode = string | null;
type Territorialfarvann = string | null;
type Innretningstype = string | null;
type MaritimtArbeid = Maritimtarbeid[];
type HjemmebaseNavn = string | null;
type HjemmebaseLand = string | null;
type TypeFlyvninger = "NASJONAL" | "INTERNASJONAL" | "BEGGE" | null;
type Antalladmansatte = number | null;
type AntallAnsatte = number | null;
type AntallUtsendte = number | null;
type Andelomsetninginorge = number | null;
type AndelOppdragINorge = number | null;
type Andelkontrakterinorge = number | null;
type AndelRekruttertINorge = number | null;
type EkstraArbeidsgiver = string;
type Kode = string;
type Term = string | null;

type MottatteOpplysningerData =
  | {
      arbeidsgiversBekreftelse: {
        arbeidsgiverBekrefterUtsendelse: Arbeidsgiverbekrefterutsendelse;
        arbeidstakerAnsattUnderUtsendelsen: Arbeidstakeransattunderutsendelsen;
        erstatterArbeidstakerenUtsendte: Erstatterarbeidstakerenutsendte;
        arbeidstakerTidligereUtsendt24Mnd: Arbeidstakertidligereutsendt24Mnd;
        arbeidsgiverBetalerArbeidsgiveravgift: Arbeidsgiverbetalerarbeidsgiveravgift;
        trygdeavgiftTrukketGjennomSkatt: Trygdeavgifttrukketgjennomskatt;
        trygdeavgiftTrukketGjennomSkattDato: string | null;
      };
      loennOgGodtgjoerelse: LoennOgGodtgjoerelse;
      personOpplysninger: Personopplysninger;
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
      foretakUtland: Foretakutland[];
      oppholdUtland: Oppholdutland;
      bosted: Bosted;
      selvstendigArbeid: Selvstendigarbeid;
      maritimtArbeid: MaritimtArbeid;
      luftfartBaser: LuftfartBase[];
      soeknadsland: Soeknadsland;
      periode: Periode;
      juridiskArbeidsgiverNorge: Juridiskarbeidsgivernorge;
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
        samletUtsendingsperiode: NullablePeriode;
      } | null;
    }
  | {
      juridiskArbeidsgiverNorge: Juridiskarbeidsgivernorge;
      personOpplysninger: Personopplysninger;
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
      foretakUtland: Foretakutland[];
      oppholdUtland: Oppholdutland;
      bosted: Bosted;
      selvstendigArbeid: Selvstendigarbeid;
      maritimtArbeid: MaritimtArbeid;
      luftfartBaser: LuftfartBase[];
      soeknadsland: Soeknadsland;
      periode: Periode;
      overgangsregelbestemmelser: (Kodeverk | string)[];
      ytterligereInformasjon: string | null;
    }
  | {
      arbeidsgiversBekreftelse: {
        arbeidsgiverBekrefterUtsendelse: Arbeidsgiverbekrefterutsendelse;
        arbeidstakerAnsattUnderUtsendelsen: Arbeidstakeransattunderutsendelsen;
        erstatterArbeidstakerenUtsendte: Erstatterarbeidstakerenutsendte;
        arbeidstakerTidligereUtsendt24Mnd: Arbeidstakertidligereutsendt24Mnd;
        arbeidsgiverBetalerArbeidsgiveravgift: Arbeidsgiverbetalerarbeidsgiveravgift;
        trygdeavgiftTrukketGjennomSkatt: Trygdeavgifttrukketgjennomskatt;
        trygdeavgiftTrukketGjennomSkattDato: string | null;
      };
      loennOgGodtgjoerelse: LoennOgGodtgjoerelse;
      personOpplysninger: Personopplysninger;
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
      foretakUtland: Foretakutland[];
      oppholdUtland: Oppholdutland;
      bosted: Bosted;
      selvstendigArbeid: Selvstendigarbeid;
      maritimtArbeid: MaritimtArbeid;
      luftfartBaser: LuftfartBase[];
      soeknadsland: Soeknadsland;
      periode: Periode;
      juridiskArbeidsgiverNorge: Juridiskarbeidsgivernorge;
      trygdedekning:
        | (
            | "UTEN_DEKNING"
            | "FULL_DEKNING_EOSFO"
            | "FTRL_2_9_FØRSTE_LEDD_A_HELSE"
            | "FTRL_2_9_FØRSTE_LEDD_A_ANDRE_LEDD_HELSE_SYKE_FORELDREPENGER"
            | "FTRL_2_9_FØRSTE_LEDD_B_PENSJON"
            | "FTRL_2_9_FØRSTE_LEDD_C_HELSE_PENSJON"
            | "FTRL_2_9_FØRSTE_LEDD_C_ANDRE_LEDD_HELSE_PENSJON_SYKE_FORELDREPENGER"
            | "FULL_DEKNING_FTRL"
            | "FTRL_2_7_TREDJE_LEDD_B_HELSE_SYKE_FORELDREPENGER"
            | "FTRL_2_7A_ANDRE_LEDD_B_HELSE_SYKE_FORELDREPENGER"
          )
        | null;
    }
  | {
      arbeidsgiversBekreftelse: {
        arbeidsgiverBekrefterUtsendelse: Arbeidsgiverbekrefterutsendelse;
        arbeidstakerAnsattUnderUtsendelsen: Arbeidstakeransattunderutsendelsen;
        erstatterArbeidstakerenUtsendte: Erstatterarbeidstakerenutsendte;
        arbeidstakerTidligereUtsendt24Mnd: Arbeidstakertidligereutsendt24Mnd;
        arbeidsgiverBetalerArbeidsgiveravgift: Arbeidsgiverbetalerarbeidsgiveravgift;
        trygdeavgiftTrukketGjennomSkatt: Trygdeavgifttrukketgjennomskatt;
        trygdeavgiftTrukketGjennomSkattDato: string | null;
      };
      loennOgGodtgjoerelse: LoennOgGodtgjoerelse;
      personOpplysninger: Personopplysninger;
      foretakUtland: Foretakutland[];
      oppholdUtland: Oppholdutland;
      bosted: Bosted;
      selvstendigArbeid: Selvstendigarbeid;
      soeknadsland: Soeknadsland;
      periode: Periode;
      juridiskArbeidsgiverNorge: Juridiskarbeidsgivernorge;
      representantIUtlandet: RepresentantIUtlandet | null;
    };

export type MottatteOpplysningerReqDto = MottatteOpplysningerData;

export interface MottatteOpplysningerResDto {
  mottaksdato: string | null;
  data: MottatteOpplysningerData;
  type: string;
}
interface Personopplysninger {
  utenlandskIdent: UtenlandskIdent[];
  medfolgendeFamilie: MedfolgendeBarn;
  foedestedOgLand: FoedestedOgLand;
}

interface Oppholdutland {
  oppholdslandkoder: Oppholdslandkode[];
  oppholdsPeriode: Oppholdsperiode;
  ektefelleEllerBarnINorge: Ektefelleellerbarninorge;
  studentFinansieringKode: Studentfinansieringkode;
  studentSemester: Studentsemester;
}
interface Oppholdsperiode {
  fom: string;
  tom: string | null;
}
interface Bosted {
  intensjonOmRetur: Intensjonomretur;
  antallMaanederINorge: Antallmaanederinorge;
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
interface Selvstendigarbeid {
  erSelvstendig: Erselvstendig;
  selvstendigForetak: Selvstendigforetak[];
}

interface Maritimtarbeid {
  enhetNavn: EnhetNavn;
  fartsomradeKode: Fartsomradekode;
  flaggLandkode: Flagglandkode;
  innretningLandkode: string | null;
  territorialfarvann: Territorialfarvann;
  innretningstype: Innretningstype;
}
interface RepresentantIUtlandet {
  representantNavn: string;
  adresselinjer: string[];
  representantLand: string | null;
}
interface LuftfartBase {
  hjemmebaseNavn: HjemmebaseNavn;
  hjemmebaseLand: HjemmebaseLand;
  typeFlyvninger: TypeFlyvninger;
}
export interface Soeknadsland {
  landkoder: string[];
  erUkjenteEllerAlleEosLand: boolean;
}
export interface Periode {
  fom: string;
  tom: string | null;
}
interface Juridiskarbeidsgivernorge {
  antallAdmAnsatte: Antalladmansatte;
  antallAnsatte: AntallAnsatte;
  antallUtsendte: AntallUtsendte;
  andelOmsetningINorge: Andelomsetninginorge;
  andelOppdragINorge: AndelOppdragINorge;
  andelKontrakterINorge: Andelkontrakterinorge;
  andelRekruttertINorge: AndelRekruttertINorge;
  ekstraArbeidsgivere: EkstraArbeidsgiver[];
  erOffentligVirksomhet: boolean | null;
}
interface NullablePeriode {
  fom: string | null;
  tom: string | null;
}
interface Kodeverk {
  kode: Kode;
  term: Term;
}
