import {
  object,
  string,
  mixed,
} from 'yup';

const SKRIV_INN_FNR_ELLER_DNR = { melding: 'Skriv inn f.nr eller d.nr' };
const SKRIV_INN_KUN_NUMMER = { melding: 'Skriv inn kun nummer.' };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: 'Skriv inn gyldig f.nr eller d.nr' };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: 'Fant ingen navn på dette f.nr eller d.nr.' };

const journalforingSED = object().shape({
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
  bruker: mixed(),
});

export { journalforingSED };
