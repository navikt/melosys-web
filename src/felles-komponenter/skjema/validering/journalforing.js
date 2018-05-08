import * as Person from './generisk/person';
import * as Organisasjon from './generisk/organisasjon';

const erIdOppgitt = verdier => ((verdier.brukerID === '') ? 'Tast inn fnr eller dnr.' : false);
const erIdNummer = verdier => (Number.isNaN(verdier.brukerID) ? 'Tast inn kun nummer.' : false);
const erIdFnr = verdier => (!Person.erFnr(verdier.brukerID) ? 'Tast inn gyldig fødselsnummer' : false);
const eksistererId = ({ avsenderNavn, avsenderID }) => {
  if (avsenderNavn === '' && Organisasjon.erOrgnr(avsenderID)) {
    return 'Fant ingen navn på dette organisasjonsnummeret.';
  }
  if (avsenderNavn === '' && (Person.erFnr(avsenderID) || Person.erDnr(avsenderID))) {
    return 'Fant ingen navn på dette fnr eller dnr.';
  }
  return false;
};
const dokumentTittelErOppgitt = verdier => (verdier.dokumentTittel.length === 0 ? 'Velg dokumenttittel fra listen eller skriv din egen.' : false);
const minstEnVedleggTittelErOppgitt = ({ vedleggsTitler = [] }) => (vedleggsTitler.length === 0 ? 'Velg minst én vedleggstittel eller skriv inn din egen' : false);

const JournalforingValidering = verdier => {
  const brukerID = erIdOppgitt(verdier) || erIdNummer(verdier) || erIdFnr(verdier) || eksistererId(verdier) || false;
  const avsenderID = erIdOppgitt(verdier) || erIdNummer(verdier) || erIdFnr(verdier) || eksistererId(verdier) || false;
  const dokumentTittel = dokumentTittelErOppgitt(verdier) || false;
  const vedleggsTitler = minstEnVedleggTittelErOppgitt(verdier) ? { _error: minstEnVedleggTittelErOppgitt(verdier) } : false;

  const valideringsObjekt = {
    brukerID,
    avsenderID,
    dokumentTittel,
    vedleggsTitler,
  };

  return valideringsObjekt;
};

export default JournalforingValidering;
