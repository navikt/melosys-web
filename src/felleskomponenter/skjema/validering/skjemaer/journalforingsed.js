import * as Utils from '../../../../utils';

const {
  object, string, mixed,
} = Utils.yup;

const SKRIV_INN_FNR_ELLER_DNR = { melding: 'Skriv inn fnr eller dnr.' };
const SKRIV_INN_KUN_NUMMER = { melding: 'Skriv inn kun nummer.' };
const SKRIV_INN_GYLDIG_FNR_ELLER_DNR = { melding: 'Skriv inn gyldig fnr eller dnr.' };
const FANT_INGEN_NAVN_PA_ORGNR = { melding: 'Fant ingen navn på dette organisasjonsnummeret.' };
const FANT_INGEN_NAVN_PA_FNR_ELLER_DNR = { melding: 'Fant ingen navn på dette fnr eller dnr.' };

const journalforingSED = object().shape({
  brukerID: string()
    .ensure()
    .erIkkeBlank(SKRIV_INN_FNR_ELLER_DNR)
    .erNummer(SKRIV_INN_KUN_NUMMER)
    .erFnrEllerDnr(SKRIV_INN_GYLDIG_FNR_ELLER_DNR)
    .when('bruker', {
      is: undefined,
      then: string()
        .harIkkeOrgnrLengde(FANT_INGEN_NAVN_PA_ORGNR)
        .harIkkeFnrEllerDnrLengde(FANT_INGEN_NAVN_PA_FNR_ELLER_DNR),
    }),
  bruker: mixed(),
});

export { journalforingSED };
