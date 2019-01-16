// Melosys-kodeverk
// Se Confluence koder for oversikt

import { kodeset } from 'melosys-kodeverk';

export const INNVILGET = 'INNVILGET';
export const INNGANGSVILKAAR_EOSFO = 'INNGANGSVILKAAR_EOSFO';

// Vedtakskoder
export const FASTSATT_LOVVALGSLAND = 'FASTSATT_LOVVALGSLAND';
export const ANMODNING_OM_UNNTAK = 'ANMODNING_OM_UNNTAK';

// Type trygdedekning, brukt i lovvalgsperiode
export const FULL_DEKNING_EOSFO = 'FULL_DEKNING_EOSFO';
export const UTEN_DEKNING = 'UTEN_DEKNING';
export const PLIKTIG = 'PLIKTIG';

// Begrunnelsekoder
export const FEIL_LAND_JOURNALFOERING = 'FEIL_LAND_JOURNALFOERING';

// Interne frontend-spesifikke koder. Disse har ikke fag, brev eller arkitektur noe
// forhold til, og benyttes kun frontend for å avgjøre riktige steg pr ID.
export const OPPHOLDSLAND = 'OPPHOLDSLAND';
export const YRKESGRUPPE = 'YRKESGRUPPE';
export const YRKESAKTIVITET_ANTALL_LAND = 'YRKESAKTIVITET_ANTALL_LAND';
export const YRKESAKTIVITET = 'YRKESAKTIVITET';
export const AVKLARTE_ARBEIDSGIVER = 'AVKLARTE_ARBEIDSGIVER';
export const SOKKEL = 'SOKKEL';
export const SKIP = 'SKIP';

export const {
  lovvalgsbestemmelser: {
    forordning_883_2004: {
      FO_883_2004_ART11_1,
      FO_883_2004_ART12_1,
      FO_883_2004_ART12_2,
      FO_883_2004_ART11_3A,
      FO_883_2004_ART11_3B,
      FO_883_2004_ART11_3C,
      FO_883_2004_ART11_3E,
      FO_883_2004_ART11_4_2,
      FO_883_2004_ART16_1,
      FO_883_2004_ART13_1A,
      ART13_1A,
      FO_883_2004_ART13_1B1,
      FO_883_2004_ART13_1_B2,
      FO_883_2004_ART13_1_B3,
      FO_883_2004_ART13_1_B4,
      FO_883_2004_ART13_2A,
      FO_883_2004_ART13_2B,
      FO_883_2004_ART13_3,
      FO_883_2004_ART13_4,
      FO_883_2004_ART16_2,
    },
    forordning_987_2009: {
      FO_987_2009_ART14_11,
    },
    tillegg: {
      FO_883_2004_ART11_2,
      FO_883_2004_ART11_4_1,
      FO_883_2004_ART11_5,
      FO_883_2004_ART87_7,
      FO_883_2004_ART87A,
    },
  },
  vilkaar: {
    ART12_1_VESENTLIG_VIRKSOMHET,
    ART12_2_NORMALT_DRIVER_VIRKSOMHET,
    ART12_1_FORUTGAAENDE_MEDLEMSKAP,
    FTRL_2_12_UNNTAK_TURISTSKIP,
    BOSATT_I_NORGE,
    FO_883_2004_INNGANGSVILKAAR,
  },
  brev: {
    produserbareDokumenter: {
      INNVILGELSE_YRKESAKTIV,
      MELDING_FORVENTET_SAKSBEHANDLINGSTID,
      ORIENTERING_ANMODNING_UNNTAK,
      MELDING_MANGLENDE_OPPLYSNINGER,
      MELDING_HENLAGT_SAK,
      ATTEST_A1,
    },
  },
  yrker: {
    yrkesaktivitetstyper: {
      LOENNET_ARBEID,
      FRILANSER,
      SELVSTENDIG,
    },
    yrkesgrupper: {
      SOKKEL_ELLER_SKIP,
      FLYENDE_PERSONELL,
      ORDINAER,
    },
  },
  aktoerroller: {
    BRUKER,
    ARBEIDSGIVER,
    REPRESENTANT,
    MYNDIGHET,
  },
  dokumenttitler: {
    ARBF,
    BKR_MEDL,
    INNT_SKAT,
    MERK,
    STUDIE_DOKUMENTASJON,
    SOK_MED,
    BEKR_UNNT_FRA_MEDL,
  },
  finansiering: {
    LAANEKASSEN,
    UTENLANDSK_INSTITUSJON,
    EGNE_MIDLER,
  },
  henleggelsesgrunner: {
    SOEKNADEN_TRUKKET,
    OPPHOLD_UTL_AVLYST,
    ANNET,
  },
  landkoder: {
    CH,
    BE,
    BG,
    DK,
    EE,
    FI,
    FR,
    GR,
    IE,
    IS,
    IT,
    HR,
    CY,
    LV,
    LI,
    LT,
    LU,
    MT,
    NL,
    NO,
    PL,
    PT,
    RO,
    SK,
    SI,
    ES,
    GB,
    SE,
    DE,
    HU,
    AT,
  },
  medlemskapstyper: {
    FRIVILLIG,
    UNNTATT,
  },
  mottaksretning: {
    INN,
    UT,
    NOTAT,
  },
  oppgavetyper: {
    BEH_SAK,
    JFR,
  },
  representerer: {
    BEGGE,
  },
} = kodeset;

/* Fartsomrader er spesifikk til front-end */
const fartsomrader = [
  { kode: 'innenriks', term: 'Innenriks' },
  { kode: 'utenriks', term: 'Utenriks' },
];

export { fartsomrader };
