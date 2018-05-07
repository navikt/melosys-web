import * as Person from './generisk/person';
import * as Organisasjon from './generisk/organisasjon';

const brukerIDErOppgitt = verdier => ((verdier.brukerID === '') ? 'Tast inn fnr eller dnr.' : null);
const brukerIDFinnes = verdier => ((verdier.brukerNavn === '' && verdier.brukerID !== '') ? 'Fant ingen navn på fnr eller dnr.' : null);
const avsenderIDErNummer = verdier => (Number.isNaN(verdier.brukerID) ? 'Kun tall er tillatt i dette feltet.' : null);
const avsenderIDFinnes = ({ avsenderNavn, avsenderID }) => {
  if (avsenderNavn === '' && Organisasjon.erOrgnr(avsenderID)) {
    return 'Fant ingen navn på dette organisasjonsnummeret.';
  }
  if (avsenderNavn === '' && (Person.erFnr(avsenderID) || Person.erDnr(avsenderID))) {
    return 'Fant ingen navn på dette fnr eller dnr.';
  }
  return false;
};

const JournalforingValidering = verdier => {
  const brukerID = brukerIDErOppgitt(verdier) || brukerIDFinnes(verdier) || false;
  const avsenderID = avsenderIDErNummer(verdier) || avsenderIDFinnes(verdier) || false;

  const valideringsObjekt = {
    brukerID,
    avsenderID,
  };

  return valideringsObjekt;
};

export {
  brukerIDErOppgitt,
  brukerIDFinnes,
  avsenderIDErNummer,
  avsenderIDFinnes,
};

export default JournalforingValidering;
