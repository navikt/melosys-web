/** Hver fane kan ha en rekke forskjellige statuser som er ment å indikere
 * feil eller varsler som saksbehandleren må håndtere.
 */
export const FANE_STATUS = {
  UBEHANDLET: "UBEHANDLET",
  AKTIV: "AKTIV",
  OK: "OK",
  ADVARSEL: "ADVARSEL",
  FEIL: "FEIL",
} as const;

export type FaneStatus = (typeof FANE_STATUS)[keyof typeof FANE_STATUS];

export const STEG = {
  AVSLAG_12_X_OG_16: "AVSLAG_12_X_OG_16",
  ARTIKKEL_16_ANMODNING: "ARTIKKEL_16_ANMODNING",
  ARTIKKEL_16_MOTTA_SVAR: "ARTIKKEL_16_MOTTA_SVAR",
  ARTIKKEL_16_VEDTAK: "ARTIKKEL_16_VEDTAK",
  ARTIKKEL_12_1: "ARTIKKEL_12_1",
  ARTIKKEL_12_2: "ARTIKKEL_12_2",
  ARTIKKEL_11_4: "ARTIKKEL_11_4",
  ARTIKKEL_13_1_A_VEDTAK: "ARTIKKEL_13_1_A_VEDTAK",
  ARTIKKEL_13_1_B_VEDTAK: "ARTIKKEL_13_1_B_VEDTAK",
  ARTIKKEL_13_1_B_UTPEK_LAND: "ARTIKKEL_13_1_B_UTPEK_LAND",
  ARTIKKEL_13_2_B: "ARTIKKEL_13_2_B",
  ARTIKKEL_13_2_B_UTPEK_LAND: "ARTIKKEL_13_2_B_UTPEK_LAND",
  ARTIKKEL_13_2_A_VEDTAK: "ARTIKKEL_13_2_A_VEDTAK",
  ARTIKKEL_13_2_B_NORGE: "ARTIKKEL_13_2_B_NORGE",
  ARTIKKEL_13_3_VEDTAK: "ARTIKKEL_13_3_VEDTAK",
  ARTIKKEL_13_3_UTPEK_LAND: "ARTIKKEL_13_3_UTPEK_LAND",
  ARTIKKEL_13_4_VEDTAK: "ARTIKKEL_13_4_VEDTAK",
  ARTIKKEL_13_4_UTPEK_LAND: "ARTIKKEL_13_4_UTPEK_LAND",
  INNGANG: "INNGANG",
  YRKESGRUPPE: "YRKESGRUPPE",
  FORUTGAENDE_MEDLEMSKAP: "FORUTGAENDE_MEDLEMSKAP",
  YRKESAKTIVITET: "YRKESAKTIVITET",
  ARBEIDSMONSTER: "ARBEIDSMONSTER",
  UTSENDING: "UTSENDING",
  VESENTLIG_VIRKSOMHET: "VESENTLIG_VIRKSOMHET",
  NORMALT_DRIVER_VIRKSOMHET: "NORMALT_DRIVER_VIRKSOMHET",
  BOSTEDSLAND: "BOSTEDSLAND",
  FORRETNINGSSTED: "FORRETNINGSSTED",
  VIRKSOMHETER: "VIRKSOMHETER",
  SOKKEL_SKIP: "SOKKEL_SKIP",
  VEDTAK: "VEDTAK",
  ENDRET_PERIODE: "ENDRE_PERIODE",
  VIDERESEND: "VIDERESEND",
  VURDER_ARBEIDSLAND: "VURDER_ARBEIDSLAND",
  VURDER_UTPEKING: "VURDER_UTPEKING",
  GODKJENN_UTPEKING_NORGE: "GODKJENN_UTPEKING_NORGE",
  GODKJENN_UTPEKING_ANNET_LAND: "GODKJENN_UTPEKING_ANNET_LAND",
  AVSLAA_UTPEKING: "AVSLAA_UTPEKING",
  VURDERING_TRYGDEAVGIFT: "VURDERING_TRYGDEAVGIFT",
  ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK: "ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK",
  MEDFOLGENDE_BARN: "MEDFOLGENDE_BARN",
  VURDERING_PERIODE: "VURDERING_PERIODE",
} as const;

/**
 * Lightweight props passed to steg constructor.
 * Contains necessary data and handlers for steg initialization.
 */
export interface PropsLight {
  behandlingID?: string;
  lovvalgsbestemmelse?: string;
  generiskStegRedigerbart: boolean;
  aktivtSteg: boolean;
  avklartefakta?: unknown[];
  vilkar?: unknown[];
  stegErGyldig?: boolean;
  tilgjengeligeHandlers: {
    bekreftOgFortsett: () => void;
    tilbake: () => void;
    byggLovvalgsperioder: () => void;
    oppdaterStegData: (stegId: string, felt: string, verdi: unknown) => void;
    slettStegData: (stegId: string, data?: unknown) => void;
    oppdater: () => void;
  };
}

/**
 * Criteria for determining next step.
 * Used by steg.nesteSteg() to evaluate which step comes next.
 */
export interface StegKriterie {
  exec: (avklartefakta?: unknown[], vilkar?: unknown[]) => boolean;
  nesteSteg: string;
}
