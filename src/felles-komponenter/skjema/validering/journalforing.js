import * as Person from './generisk/person';
import * as Organisasjon from './generisk/organisasjon';

/** Mikrovalidering pr hendelse. Dette gjør at vi kan både kan spisse tekstlig tilbakemelding
 * og validere på tvers av verdier.
 */
const idErBlank = verdi => ((verdi === '') && 'Tast inn fnr eller dnr.');
const idErIkkeNummer = verdi => (!(new RegExp(/^\d+$/).test(verdi)) && 'Tast inn kun nummer.');
const erIdErIkkeFnrEllerDnr = verdi => ((!Person.erFnr(verdi) && !Person.erDnr(verdi)) && 'Tast inn gyldig fnr eller dnr.');
const idFinnesIkke = (navn, id) => {
  if (navn === '' && Organisasjon.erOrgnr(id)) {
    return 'Fant ingen navn på dette organisasjonsnummeret.';
  }
  if (navn === '' && (Person.erFnr(id) || Person.erDnr(id))) {
    return 'Fant ingen navn på dette fnr eller dnr.';
  }
  return null;
};

const dokumentTittelErBlank = verdier => (verdier.dokumentTittel.length === 0 ? 'Velg dokumenttittel fra listen eller skriv din egen.' : false);
const vedleggTittelErBlank = ({ vedleggsTitler = [] }) => (vedleggsTitler.length === 0 ? 'Velg minst én vedleggstittel eller skriv inn din egen' : false);
const eksisterendeSakIkkeValgt = verdier => (!verdier.saksnummer ? 'velg sak' : false);

/** Ved å short circuite igjennom alle forutsetninger helt til den siste som returnerer false,
 * kan vi bygge opp sjekk per felt-navn. Rekkefølgen har betydning med hensyn til hvilken feilmelding
 * som er relevant. Feks: feilmelding om at et felt er tomt skal vises før feilmelding om at fødselsnummer ikke er gyldig.
 */
const JournalforingGenerellValidering = verdier => {
  const brukerIDFeilmelding = (
    idErBlank(verdier.brukerID) ||
    idErIkkeNummer(verdier.brukerID) ||
    erIdErIkkeFnrEllerDnr(verdier.brukerID) ||
    idFinnesIkke(verdier.brukerNavn, verdier.brukerID) ||
    false
  );

  const avsenderIDFeilmelding = (
    idErBlank(verdier.avsenderID) ||
    idErIkkeNummer(verdier.avsenderID) ||
    erIdErIkkeFnrEllerDnr(verdier.avsenderID) ||
    idFinnesIkke(verdier.avsenderNavn, verdier.avsenderID) ||
    false
  );

  const dokumentTittelFeilmelding = dokumentTittelErBlank(verdier) || false;

  const vedleggsTitlerFeilmelding = vedleggTittelErBlank(verdier) ? { _error: vedleggTittelErBlank(verdier) } : false;

  const valideringsObjekt = {
    brukerID: brukerIDFeilmelding,
    avsenderID: avsenderIDFeilmelding,
    dokumentTittel: dokumentTittelFeilmelding,
    vedleggsTitler: vedleggsTitlerFeilmelding,
  };

  return valideringsObjekt;
};

export {
  eksisterendeSakIkkeValgt,
};

export default JournalforingGenerellValidering;
