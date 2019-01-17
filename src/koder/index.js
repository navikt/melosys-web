// Melosys-kodeverk
// Se Confluence koder for oversikt

import { kodeverk, kodeset, kodemap } from 'melosys-kodeverk';

import lovvalgsbestemmelser from './lovvalgsbestemmelser';
import trygdedekninger from './trygdedekninger';
import medlemskapstyper from './medlemskapstyper';
import landkoder from './landkoder';
import vilkar from './vilkar';

export {
  kodeverk,
  kodeset,
  kodemap,
};

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

/* Fartsomrader er spesifikk til front-end */
const fartsomrader = [
  { kode: 'innenriks', term: 'Innenriks' },
  { kode: 'utenriks', term: 'Utenriks' },
];

export { fartsomrader };

export {
  lovvalgsbestemmelser,
  trygdedekninger,
  medlemskapstyper,
  landkoder,
  vilkar,
};
