// Melosys-kodeverk
// Se Confluence koder for oversikt

import { kodeverk, kodeset, kodemap } from 'melosys-kodeverk';

import lovvalgsbestemmelser from './lovvalgsbestemmelser';
import trygdedekninger from './trygdedekninger';
import medlemskapstyper from './medlemskapstyper';
import landkoder from './landkoder';
import vilkar from './vilkar';
import begrunnelser from './begrunnelser';
import behandlinger from './behandlinger';
import brev from './brev';
import aktoerroller from './aktoerroller';
import mottaksretning from './mottaksretning';
import oppgavetyper from './oppgavetyper';
import representerer from './representerer';
import sakstyper from './sakstyper';


export {
  kodeverk,
  kodeset,
  kodemap,
};

export const INNVILGET = 'INNVILGET';
export const INNGANGSVILKAAR_EOSFO = 'INNGANGSVILKAAR_EOSFO';

// Interne frontend-spesifikke koder. Disse har ikke fag, brev eller arkitektur noe
// forhold til, og benyttes kun frontend for å avgjøre riktige steg pr ID.
export const OPPHOLDSLAND = 'OPPHOLDSLAND';
export const YRKESGRUPPE = 'YRKESGRUPPE';
export const YRKESAKTIVITET_ANTALL_LAND = 'YRKESAKTIVITET_ANTALL_LAND';
export const YRKESAKTIVITET = 'YRKESAKTIVITET';
export const AVKLARTE_ARBEIDSGIVER = 'AVKLARTE_ARBEIDSGIVER';
export const SOKKEL = 'SOKKEL';
export const SKIP = 'SKIP';

/* Fartsomrader skal ikke/er ikke i kodeverk, se arbeidslandbegrunnelser på confluence */
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
  begrunnelser,
  behandlinger,
  brev,
  aktoerroller,
  mottaksretning,
  oppgavetyper,
  representerer,
  sakstyper,
};
