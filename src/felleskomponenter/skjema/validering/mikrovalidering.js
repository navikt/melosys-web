import * as Person from './generisk/person';
import * as Organisasjon from './generisk/organisasjon';

/** Mikrovalidering pr hendelse. Dette gjør at vi kan både kan spisse tekstlig tilbakemelding
 * og validere på tvers av verdier.
 */
export const idErBlank = verdi => ((verdi === '') && { melding: 'Skriv inn fnr eller dnr.' });
export const navnAvsenderErBlank = verdi => ((verdi === '' || verdi === undefined) && { melding: 'Skriv inn navn på avsender.' });
export const idErIkkeNummer = verdi => (!(new RegExp(/^\d+$/).test(verdi)) ? { melding: 'Skriv inn kun nummer.' } : false);
export const idErIkkeFnrEllerDnr = verdi => ((!Person.erGyldigFnr(verdi) && !Person.erGyldigDnr(verdi)) && { melding: 'Skriv inn gyldig fnr eller dnr.' });
export const idErIkkeFnrEllerDnrEllerOrgnr = verdi => (
  (!(Person.erGyldigFnr(verdi) || Person.erGyldigDnr(verdi) || Organisasjon.erOrgnrLengde(verdi))) ? { melding: 'Skriv inn gyldig fnr, dnr eller orgnr.' } : false
);
export const idErIkkeOrgnr = verdi => (!Organisasjon.erOrgnrGyldig(verdi) && { melding: 'Skriv inn gyldig orgnr.' });

export const idFinnesIkke = (navn, id) => {
  if (navn === '' && Organisasjon.erOrgnrLengde(id)) {
    return { melding: 'Fant ingen navn på dette organisasjonsnummeret.' };
  }
  if (navn === '' && (Person.erFnrLengde(id) || Person.erDnrLengde(id))) {
    return { melding: 'Fant ingen navn på dette fnr eller dnr.' };
  }
  return null;
};
