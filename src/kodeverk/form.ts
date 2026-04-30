import { StrukturertAdresse } from "../services/api";

export const SAKSPLUKKER_FORM = "saksplukkerform";
export const SEND_BREV = "send_brev";
export const FORSIDE_JOURNALFORINGS_FORM = "journalforingsform";
export const JOURNALFORING = "journalforing";
export const JOURNALFORING_SED = "journalforing_sed";

export enum JournalforingValues {
  sakstype = "sakstype",
  sakstema = "sakstema",
  behandlingstema = "behandlingstema",
  opprettnysak_behandlingstema = "opprettnysak_behandlingstema",
  behandlingstype = "behandlingstype",
  opprettnysak_behandlingstype = "opprettnysak_behandlingstype",
  hovedpart = "journalforingGjelder",
  soknadsland = "journalforingSoknadsland",
  soknadslandFlereLandUkjentHvilke = "journalforingSoknadslandFlereLandUkjentHvilke",
  periodeFraOgMed = "journalforingPeriodeFraOgMed",
  periodeTilOgMed = "journalforingPeriodeTilOgMed",
  opprettBehandling = "opprettBehandling",
  saksnummer = "saksnummer",
  formNavn = "journalforing",
}

export const SOKNAD = "soknad";

export interface ArbeidsforholdUtland {
  uuid: string;
  navn?: string;
  orgnr?: string;
  selvstendigNaeringsvirksomhet: boolean;
  tilhorerSammeKonsern?: boolean | null;
  adresse?: Partial<StrukturertAdresse>;
}

export interface FysiskArbeidssted {
  adresse: Partial<StrukturertAdresse>;
  virksomhetNavn?: string | null;
}
export interface ArbeidsstedPaaLand {
  fysiskeArbeidssteder?: FysiskArbeidssted[];
  erHjemmekontor?: boolean | null;
  erFastArbeidssted?: boolean | null;
}
export interface ArbeidsstedFly {
  hjemmebaseNavn?: string;
  hjemmebaseLand?: string;
  typeFlyvninger?: string;
  erVanligHjemmebase?: boolean | null;
  vanligHjemmebaseLand?: string;
  vanligHjemmebaseNavn?: string;
}
interface MaritimtArbeid {
  enhetNavn?: string;
}
export interface ArbeidsstedOffshore extends MaritimtArbeid {
  innretningLandkode?: string;
  innretningstype?: string;
}
export interface ArbeidsstedSkip extends MaritimtArbeid {
  fartsomradeKode?: string;
  flaggLandkode?: string;
  territorialfarvann?: string;
  yrke?: string;
}
export interface RepresentantIUtlandet {
  representantNavn?: string;
  adresselinjer?: string[];
}
export interface MedfolgendeFamilie {
  uuid: string;
  fnr?: number;
  navn?: string;
  relasjonsrolle?: string;
}

export interface ArbeidssituasjonOgOevrig {
  harLoennetArbeidMinstEnMndFoerUtsending?: boolean | null;
  beskrivelseArbeidSisteMnd?: string | null;
  harAndreArbeidsgivereIUtsendingsperioden?: boolean | null;
  beskrivelseAnnetArbeid?: string | null;
  erSkattepliktig?: boolean | null;
  mottarYtelserNorge?: boolean | null;
  mottarYtelserUtlandet?: boolean | null;
}
export interface JuridiskArbeidsgiverNorge {
  antallUtsendte?: string;
  antallAdmAnsatte?: string;
  antallAnsatte?: string;
  andelOmsetningINorge?: string;
  andelOppdragINorge?: string;
  andelKontrakterINorge?: string;
  andelRekruttertINorge?: string;
  erOffentligVirksomhet?: boolean | null;
}
export interface Utenlandsoppdraget {
  erUtsendelseForOppdragIUtlandet?: boolean | null;
  erAnsattForOppdragIUtlandet?: boolean | null;
  erFortsattAnsattEtterOppdraget?: boolean | null;
  erDrattPaaEgetInitiativ?: boolean | null;
  erErstatningTidligereUtsendte?: boolean | null;
  samletUtsendingsperiode: { fom?: string | null; tom?: string | null };
}

export type SoknadFormData = any;

export const SOK_ETTER_SAK = "sokEtterSak";
export const ARTIKKEL_16_ANMODNING = "artikkel_16_anmodning";
export const ARTIKKEL_12_VEDTAK = "artikkel_12_vedtak";
export const AVSLAG_ARTIKKEL_12_OG_16 = "avslag_artikkel_12_og_16";
export const ARTIKKEL_16_MOTTA_SVAR = "artikkel_16_motta_svar";
export const ARTIKKEL_16_1_VEDTAK = "artikkel_16_1_vedtak";
export const ARTIKKEL_13_UTPEKLAND = "artikkel_13_utpekland";
export const ARTIKKEL_13_X_VEDTAK = "artikkel_13_x_vedtak";
export const OPPRETT_NY_SAK = "opprett_ny_sak";
/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum OpprettNySakValues {
  sakstype = "sakstype",
  sakstema = "sakstema",
  behandlingstema = "behandlingstema",
  opprettnysak_behandlingstema = "behandlingstema",
  behandlingstype = "behandlingstype",
  opprettnysak_behandlingstype = "behandlingstype",
  soknadsland = "soknadsland",
  soknadslandFlereLandUkjentHvilke = "soknadslandFlereLandUkjentHvilke",
  periodeFraOgMed = "periodeFraOgMed",
  periodeTilOgMed = "periodeTilOgMed",
  saksnummer = "saksnummer",
  opprettBehandling = "opprettBehandling",
  hovedpart = "hovedpart",
  formNavn = "opprett_ny_sak",
}
/* eslint-enable @typescript-eslint/no-duplicate-enum-values */
export const VURDERING_VIDERESEND = "vurdering_videresend";
export const VURDER_UTPEKING = "vurder_utpeking";
export const AVSLAA_UTPEKING = "avslaa_utpeking";
export const REGISTRERING_PANELER = "registrering_paneler";
export interface RegistreringPanelerFormData {
  oppgittAdresseTilleggsnavn: string;
  oppgittAdresseGatenavn: string;
  oppgittAdresseHusnummerEtasjeLeilighet: string;
  oppgittAdresseRegion: string;
  oppgittAdressePostboks: string;
  oppgittAdressePostnummer: string;
  oppgittAdressePoststed: string;
  oppgittAdresseLand: string;
}
export const ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK = "arbeid_tjenesteperson_eller_fly_vedtak";

export const Trygdeavtale = {
  INNGANG: "trygdeavtale_inngang",
  AVKLAR_VIRKSOMHET: "trygdeavtale_avklar_virksomhet",
  BESTEMMELSE: "trygdeavtale_bestemmelse",
  FAMILIE: "trygdeavtale_familie",
  VEDTAK: "trygdeavtale_vedtak",
};
