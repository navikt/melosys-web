import * as Person from './generisk/person';
import * as Organisasjon from './generisk/organisasjon';
import * as Dato from './generisk/dato';

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

const dokumentTittelErBlank = dokumentTittel => (dokumentTittel.length === 0 ? 'Velg dokumenttittel fra listen eller skriv din egen.' : false);
const vedleggTittelErBlank = vedleggsTitler => (vedleggsTitler.length === 0 ? 'Velg minst én vedleggstittel eller skriv inn din egen' : false);
const eksisterendeSakIkkeValgt = saksnummer => (!saksnummer ? 'Velg hvilken sak du ønsker å knytte journalføringen mot.' : false);
const datoErIkkeGyldig = dato => (!Dato.datoErGyldig(dato) ? 'Skriv inn en gyldig dato' : false);
const datoErBlank = dato => ((!dato || dato === '') ? 'Tast inn dato' : false);
const landErIkkeValgt = (landListe = []) => (landListe.length === 0 ? 'Velg minst ett land.' : false);

/** Ved å short circuite igjennom alle forutsetninger helt til den siste som returnerer false,
 * kan vi bygge opp sjekk per felt-navn. Rekkefølgen har betydning med hensyn til hvilken feilmelding
 * som er relevant. Feks: feilmelding om at et felt er tomt skal vises før feilmelding om at fødselsnummer ikke er gyldig.
 */
const journalforingGenerellValidering = verdier => {
  const brukerID = (
    idErBlank(verdier.brukerID) ||
    idErIkkeNummer(verdier.brukerID) ||
    erIdErIkkeFnrEllerDnr(verdier.brukerID) ||
    idFinnesIkke(verdier.brukerNavn, verdier.brukerID) ||
    false
  );

  const avsenderID = (
    idErBlank(verdier.avsenderID) ||
    idErIkkeNummer(verdier.avsenderID) ||
    erIdErIkkeFnrEllerDnr(verdier.avsenderID) ||
    idFinnesIkke(verdier.avsenderNavn, verdier.avsenderID) ||
    false
  );

  const dokumentTittel = dokumentTittelErBlank(verdier.dokumentTittel) || false;

  const vedleggsTitler = vedleggTittelErBlank(verdier.vedleggsTitler) ? { _error: vedleggTittelErBlank(verdier.vedleggsTitler) } : false;

  const valideringsObjekt = {
    brukerID,
    avsenderID,
    dokumentTittel,
    vedleggsTitler,
  };

  return valideringsObjekt;
};

const journalforingTilknyttSakValidering = verdier => {
  const { saksnummer } = verdier;

  return {
    saksnummer: eksisterendeSakIkkeValgt(saksnummer),
  };
};

const journalforingOpprettSakValidering = verdier => {
  const journalforingPeriodeFraOgMed = (
    datoErIkkeGyldig(verdier.journalforingPeriodeFraOgMed) ||
    datoErBlank(verdier.journalforingPeriodeFraOgMed) ||
    false
  );

  const journalforingPeriodeTilOgMed = (
    datoErIkkeGyldig(verdier.journalforingPeriodeTilOgMed) ||
    datoErBlank(verdier.journalforingPeriodeTilOgMed) ||
    false
  );

  const journalforingOppholdsLand = (
    landErIkkeValgt(verdier.journalforingOppholdsLand)
  );

  return {
    journalforingPeriodeFraOgMed,
    journalforingPeriodeTilOgMed,
    journalforingOppholdsLand,
  };
};

const journalforingSituasjonsbetingetValidering = verdier => {
  const { skjemaHensikt } = verdier;

  switch (skjemaHensikt) {
    case 'OPPRETT':
      return journalforingOpprettSakValidering(verdier);
    case 'KNYTT':
      return journalforingTilknyttSakValidering(verdier);
    default: return {};
  }
};

const journalforingValidering = verdier => ({
  ...journalforingGenerellValidering(verdier),
  ...journalforingSituasjonsbetingetValidering(verdier),
});

export default journalforingValidering;
