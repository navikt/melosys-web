import periode from '../periode-body';
import land from '../land-body';

const { Matchers } = require('@pact-foundation/pact');

const { boolean, like } = Matchers;

const faktaavklaring = {
  opphold: {
    land,
    periode,
  },
  aktivitet: {
    aktivitetLand: land,
  },
  sysselsetting: {
    sysselsettingType: like('ARBEIDSTAKER'),
  },
  utsending: {
    ansattINorskSelskap: boolean(true),
    erstatterTidligereUtsendt: boolean(false),
    utsendingMindreEnn24Mnd: boolean(true),
    foretakDriverINorge: boolean(true),
    harForutgaendeMedlemskap: boolean(true),
    arbeidKnyttetTilVirksomhetUtlandet: boolean(true),
  },
  bostedsland: {
    bekrefterFamiliebosted: null,
    bekrefterDisponering: null,
    bostedsland: [],
  },
  sektor: {
    ansattISektor: like('INGEN_AV_DISSE'),
  },
  tjenestemann: {
    tjenestemann: like('ETT_LAND_YRKESAKTIVITET_ANDRE_LAND'),
  },
  valgteArbeidsforhold: [],
  virksomhet: {
    antallLand: like('ETT_LAND_IKKE_NORGE'),
    aktivitetINorge: like('OVER_25_PROSENT'),
    marginaltArbeid: like('MARGINALT_JA'),
    vekslingMellomLand: like('EN_ELLER_BEGGE'),
  },
};
export default faktaavklaring;
