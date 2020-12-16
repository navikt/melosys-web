import { StrukturertAdresse } from 'Domene';

export const BEHANDLINGS_FORM = 'behandlingsform';
export interface BehandlingsFormData {
  behandlingstema: string,
}
export const BREV_BESTILLING = 'brevbestilling';
export const FORSIDE_JOURNALFORINGS_FORM = 'journalforingsform';
export const JOURNALFORING = 'journalforing';
export const JOURNALFORING_SED = 'journalforing_sed';

export const SOKNAD = 'soknad';

export interface ArbeidsforholdUtland {
  uuid: string,
  navn?: string,
  orgnr?: string,
  selvstendigNaeringsvirksomhet: boolean,
  adresse?: Partial<StrukturertAdresse>,
}
export interface ArbeidsstedUtland {
  adresse: {
    gatenavn?: string,
    husnummer?: string,
    landkode?: string,
    postnummer?: string,
    poststed?: string,
    region?: string,
  },
  foretakNavn?: string,
  foretakOrgnr?: string,
  arbeidUtlandHjemmekontor?: boolean,
}
export interface ArbeidsstedFly {
  hjemmebaseNavn?: string,
  hjemmebaseLand?: string,
  typeFlyvninger?: string,
}
interface MaritimtArbeid {
  enhetNavn?: string,
  foretakNavn?: string,
  foretakOrgnr?: string,
}
export interface ArbeidsstedOffshore extends MaritimtArbeid {
  installasjonsLandkode?: string,
}
export interface ArbeidsstedSkip extends MaritimtArbeid {
  fartsomradeKode?: string,
  flaggLandkode?: string,
  territorialfarvann?: string,
}
export interface MedfolgendeBarn {
  uuid: string,
  fnr?: number,
  navn?: string,
  relasjonsrolle?: string,
}

export type SoknadFormData = any;

export const SOK_ETTER_SAK = 'sokEtterSak';
export const ARTIKKEL_16_ANMODNING = 'artikkel_16_anmodning';
export const INNGANG = 'inngang';
export const ARTIKKEL_12_VEDTAK = 'artikkel_12_vedtak';
export const AVSLAG_ARTIKKEL_12_OG_16 = 'avslag_artikkel_12_og_16';
export const ARTIKKEL_16_MOTTA_SVAR = 'artikkel_16_motta_svar';
export const ARTIKKEL_16_1_VEDTAK = 'artikkel_16_1_vedtak';
export const ARTIKKEL_13_UTPEKLAND = 'artikkel_13_utpekland';
export const ARTIKKEL_13_X_VEDTAK = 'artikkel_13_x_vedtak';
export const OPPRETT_NY_SAK = 'opprett_ny_sak';
export const VURDERING_VIDERESEND = 'vurdering_videresend';
export const VURDER_UTPEKING = 'vurder_utpeking';
export const AVSLAA_UTPEKING = 'avslaa_utpeking';
export const REGISTRERING_PANELER = 'registrering_paneler';
export interface RegistreringPanelerFormData {
  oppgittAdresseGatenavn: string,
  oppgittAdresseHusnummer: string,
  oppgittAdresseRegion: string,
  oppgittAdressePostnummer: string,
  oppgittAdressePoststed: string,
  oppgittAdresseLand: string,
}
export const ARBEID_ETT_LAND_OVRIG_VEDTAK = 'arbeid_ett_land_ovrig_vedtak';
export const START = 'start';
export const PERIODER = 'perioder';
export const TRYGDEAVGIFT = 'trygdeavgift';
export const FTRL_VEDTAK = 'ftrl_vedtak';

