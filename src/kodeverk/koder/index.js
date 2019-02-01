// Melosys-kodeverk
// Se Confluence koder for oversikt

import lovvalgsbestemmelser from './lovvalgsbestemmelser';
import trygdedekninger from './trygdedekninger';
import medlemskapstyper from './medlemskapstyper';
import landkoder from './landkoder';
import vilkar from './vilkar';
import begrunnelser from './begrunnelser';
import behandlinger from './behandlinger';
import brev from './brev';
import aktoersroller from './aktoerroller';
import mottaksretning from './mottaksretning';
import oppgavetyper from './oppgavetyper';
import representerer from './representerer';
import sakstyper from './sakstyper';
import saksstatuser from './saksstatuser';
import henleggelsesgrunner from './henleggelsesgrunner';

export {
  lovvalgsbestemmelser,
  trygdedekninger,
  medlemskapstyper,
  landkoder,
  vilkar,
  begrunnelser,
  behandlinger,
  brev,
  aktoersroller,
  mottaksretning,
  oppgavetyper,
  representerer,
  sakstyper,
  saksstatuser,
  henleggelsesgrunner,
};

export const INNVILGET = 'INNVILGET';

// Interne frontend-spesifikke koder. Disse har ikke fag, brev eller arkitektur noe
// forhold til, og benyttes kun frontend for å avgjøre riktige steg pr ID.
export const OPPHOLDSLAND = 'OPPHOLDSLAND';
export const YRKESGRUPPE = 'YRKESGRUPPE';
export const YRKESAKTIVITET_ANTALL_LAND = 'YRKESAKTIVITET_ANTALL_LAND';
export const YRKESAKTIVITET = 'YRKESAKTIVITET';
export const AVKLARTE_ARBEIDSGIVER = 'AVKLARTE_ARBEIDSGIVER';
export const SOKKEL = 'SOKKEL';
export const SKIP = 'SKIP';
export const VurderingSokkelSkipTyper = {
  SKIP_NORSK_TERRITORIAL: 'SKIP_NORSK_TERRITORIAL',
  SKIP_ETT_LAND: 'SKIP_ETT_LAND',
  SOKKEL_NORSK: 'SOKKEL_NORSK',
  SOKKEL_UTLAND: 'SOKKEL_UTLAND',
  SOKKEL_ELLER_SKIP_FLERE_LAND: 'SOKKEL_ELLER_SKIP_FLERE_LAND',
};
export const VurderingForretningsstedTyper = {
  ID: 'FORRETNINGSSTED',
  EN_ARBEIDSGIVER: 'EN_ARBEIDSGIVER',
  TO_ELLER_FLERE_ARBEIDSGIVERE: 'TO_ELLER_FLERE_ARBEIDSGIVERE',
  SAMME_LAND: 'SAMME_LAND',
  ULIKE_LAND: 'ULIKE_LAND',
};
export const VurderingIkkeYrkesaktivTyper = {
  STUDENT: 'STUDENT',
  PENSJONIST: 'PENSJONIST',
  INGEN_AV_DISSE: 'INGEN_AV_DISSE',
};
export const VurderingTjenestemannTyper = {
  ID: 'OFFENTLIGTJENSTEMANN',
  ETT_LAND: 'ETT_LAND',
  ETT_LAND_YRKESAKTIVITET_ANDRE_LAND: 'ETT_LAND_YRKESAKTIVITET_ANDRE_LAND',
  FLERE_LAND: 'FLERE_LAND',
  FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND: 'FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND',
  IKKE_TJENESTEMANN: 'IKKE_TJENESTEMANN',
};
export const VurderingVirksomhetTyper = {
  EN_ELLER_BEGGE: 'EN_ELLER_BEGGE',
  INGEN_VEKSLING: 'INGEN_VEKSLING',
  MARGINALT_JA: 'MARGINALT_JA',
  MARGINALT_NEI: 'MARGINALT_NEI',
  UNDER_25_PROSENT: 'UNDER_25_PROSENT',
  OVER_25_PROSENT: 'OVER_25_PROSENT',
};
export const VurderingYrkesaktivitetTyper = {
  ID: 'YRKESAKTIVITET',
  ORDINAER_ARBEIDSTAKER: 'ORDINAER_ARBEIDSTAKER',
  SELVSTENDIG_NAERINGSDRIVENDE: 'SELVSTENDIG_NAERINGSDRIVENDE',
  ORDINAER_OG_SELVSTENDIG: 'ORDINAER_OG_SELVSTENDIG',
  TJENESTEPERSON_NORSK_STATSFORVANTLING: 'TJENESTEPERSON_NORSK_STATSFORVANTLING',
};
export const VurderingYrkesaktivitetAntallLandTyper = {
  ETT_LAND_IKKE_NORGE: 'ETT_LAND_IKKE_NORGE',
  KUN_NORGE: 'KUN_NORGE',
  TO_ELLER_FLERE_LAND: 'TO_ELLER_FLERE_LAND',
};
export const VurderingYrkesgruppeTyper = {
  ORDINAER: 'ORDINAER',
  SOKKEL_ELLER_SKIP: 'SOKKEL_ELLER_SKIP',
  FLYENDE_PERSONELL: 'YRKESAKTIV_FLYVENDE',
  IKKE_YRKESAKTIV: 'IKKE_YRKESAKTIV',
  KONTANTYTELSESMOTTAKER: 'KONTANTYTELSESMOTTAKER',
};
