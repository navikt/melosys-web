import * as Utils from '../../../../utils';

import { Utils as MKVUtils } from '../../../../melosyskodeverk';

const {
  object, string, mixed, array, lazy,
} = Utils.yup;

const SKRIV_INN_FNR_ELLER_DNR = { melding: 'Skriv inn f.nr eller d.nr' };
const SKRIV_INN_KUN_NUMMER = { melding: 'Skriv inn kun nummer.' };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: 'Skriv inn gyldig f.nr eller d.nr' };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: 'Fant ingen navn på dette f.nr eller d.nr.' };
const TAST_INN_DATO = { melding: 'Tast inn dato' };
const SKRIV_INN_EN_GYLDIG_DATO = { melding: 'Skriv inn en gyldig dato' };
const VELG_SAKSTYPE = { melding: 'Velg sakstype' };
const VELG_BEHANDLINGSTYPE = { melding: 'Velg behandlingstype' };
const VELG_LAND = { melding: 'Velg land' };
const VELG_EN_OPPGAVE = { melding: 'Velg en oppgave' };
const MANGLER_JOURNALPOST = { melding: 'Den valgte oppgaven har ingen journalpost' };

const soknadsinfo = object().shape({
  fom: string()
    .erGyldigDato(SKRIV_INN_EN_GYLDIG_DATO)
    .required(TAST_INN_DATO),
  tom: lazy(value => (!value ?
    string()
      .ensure()
    :
    string()
      .erGyldigDato(SKRIV_INN_EN_GYLDIG_DATO)
      .required(TAST_INN_DATO))),
  land: array()
    .of(string())
    .required({ _error: VELG_LAND })
    .min(1, { _error: VELG_LAND }),
});

const opprettnysak = object().shape({
  brukerID: string()
    .ensure()
    .erIkkeBlank(SKRIV_INN_FNR_ELLER_DNR)
    .erNummer(SKRIV_INN_KUN_NUMMER)
    .erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR)
    .when('bruker', {
      is: undefined,
      then: string()
        .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
    }),
  sakstype: string()
    .required(VELG_SAKSTYPE),
  behandlingstype: string()
    .required(VELG_BEHANDLINGSTYPE),
  soknadsinfo: object()
    .when('behandlingstype', {
      is: MKVUtils.erSoknad,
      then: soknadsinfo,
    }),
  oppgaveID: string()
    .siblingIs('journalpostID', journalpostID => !Utils._isEmpty(journalpostID), MANGLER_JOURNALPOST)
    .required(VELG_EN_OPPGAVE),

  /* Følgene felter viser ingen feilmeldinger til bruker, men må være en del av skjemaet for å kunne benytte .when() for andre felter. */
  bruker: mixed(),
});

export { opprettnysak };
