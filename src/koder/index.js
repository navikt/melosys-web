import { kodeset } from 'melosys-kodeverk';

// Melosys-kodeverk
// Se Confluence koder for oversikt
export const {
  lovvalgsbestemmelser: {
    forordning_883_2004: {
      FO_883_2004_ART12_1,
      FO_883_2004_ART12_2,
      FO_883_2004_ART11_3A,
      FO_883_2004_ART11_4_1,
      FO_883_2004_ART11_4_2,
      FO_883_2004_ART16_1,
    },
  },
  vilkaar: {
    ART12_1_VESENTLIG_VIRKSOMHET,
    ART12_2_NORMALT_DRIVER_VIRKSOMHET,
    ART12_1_FORUTGAAENDE_MEDLEMSKAP,
    FTRL_2_12_UNNTAK_TURISTSKIP,
    BOSATT_I_NORGE,
  },
} = kodeset;

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
