import * as Dato from './generisk/dato';
import * as Konstanter from '../../../constants';
import * as Mikrovalidering from './mikrovalidering';
/** Mikrovalidering pr hendelse. Dette gjør at vi kan både kan spisse tekstlig tilbakemelding
 * og validere på tvers av verdier.
 */
/*
const idErBlank = verdi => ((verdi === '') && 'Skriv inn fnr eller dnr.');
const navnAvsenderErBlank = verdi => ((verdi === '' || verdi === undefined) && 'Skriv inn navn på avsender.');
const idErIkkeNummer = verdi => (!(new RegExp(/^\d+$/).test(verdi)) && 'Skriv inn kun nummer.');
const idErIkkeFnrEllerDnr = verdi => ((!Person.erGyldigFnr(verdi) && !Person.erGyldigDnr(verdi)) && 'Skriv inn gyldig fnr eller dnr.');
const idErIkkeFnrEllerDnrEllerOrgnr = verdi => ((!(Person.erGyldigFnr(verdi) || Person.erGyldigDnr(verdi) || Organisasjon.erOrgnrLengde(verdi))) && 'Skriv inn gyldig fnr, dnr eller orgnr.');
const idErIkkeOrgnr = verdi => (!Organisasjon.erOrgnrGyldig(verdi) && 'Skriv inn gyldig orgnr.');

const idFinnesIkke = (navn, id) => {
  if (navn === '' && Organisasjon.erOrgnrLengde(id)) {
    return 'Fant ingen navn på dette organisasjonsnummeret.';
  }
  if (navn === '' && (Person.erFnrLengde(id) || Person.erDnrLengde(id))) {
    return 'Fant ingen navn på dette fnr eller dnr.';
  }
  return null;
};
*/
const dokumentTittelErBlank = dokumentTittel => (dokumentTittel.length === 0 ? 'Velg dokumenttittel fra listen eller skriv din egen.' : false);
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
    Mikrovalidering.idErBlank(verdier.brukerID) ||
    Mikrovalidering.idErIkkeNummer(verdier.brukerID) ||
    Mikrovalidering.idErIkkeFnrEllerDnr(verdier.brukerID) ||
    Mikrovalidering.idFinnesIkke(verdier.brukerNavn, verdier.brukerID) ||
    false
  );

  const avsenderID = (
    !verdier.erBrukerAvsender && !Mikrovalidering.idErBlank(verdier.avsenderID) &&
    (Mikrovalidering.idErIkkeNummer(verdier.avsenderID) ||
      Mikrovalidering.idErIkkeFnrEllerDnrEllerOrgnr(verdier.avsenderID) ||
      Mikrovalidering.idFinnesIkke(verdier.avsenderNavn, verdier.avsenderID) ||
    false)
  );

  const avsenderNavn = (
    Mikrovalidering.navnAvsenderErBlank(verdier.avsenderNavn) || false
  );

  const representantID = (
    !Mikrovalidering.idErBlank(verdier.representantID) && (
      Mikrovalidering.idErIkkeOrgnr(verdier.representantID) ||
      Mikrovalidering.idFinnesIkke(verdier.representantNavn, verdier.representantID)
      || false)
  );

  const hoveddokumentTittel = dokumentTittelErBlank(verdier.hoveddokumentTittel) || false;

  return {
    brukerID,
    avsenderID,
    avsenderNavn,
    hoveddokumentTittel,
    representantID,
  };
};

/** Dersom saksbehandler forsøker å knytte en sak til journalføringen, skal de relaterte
 * feltene valideres.
 * @param verdier {object} Alle skjemaverdiene i redux-form-skjemaet.
 * @returns {{saksnummer: *}} Objekt med alle valideringene som er gjort.
 */
const journalforingTilknyttSakValidering = verdier => {
  const { saksnummer } = verdier;

  return {
    saksnummer: eksisterendeSakIkkeValgt(saksnummer),
  };
};

/** Dersom saksbehandler forsøker å opprette en ny fagsak, skal de relaterte
 * feltene valideres.
 * @param verdier {object} Alle skjemaverdiene i redux-form-skjemaet.
 * @returns {{journalforingPeriodeFraOgMed: (*|boolean), journalforingPeriodeTilOgMed: (*|boolean), journalforingOppholdsLand: *}}
 */
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

  const journalforingOppholdsLand = (landErIkkeValgt(verdier.journalforingOppholdsLand) ? { _error: landErIkkeValgt(verdier.journalforingOppholdsLand) } : false);

  return {
    journalforingPeriodeFraOgMed,
    journalforingPeriodeTilOgMed,
    journalforingOppholdsLand,
  };
};

/** Samle sammen alle situasjonsbestemte valideringsregler i ett objekt som returneres
 * til redux form.
 * @param verdier {Object} Alle skjemaverdier som det skal valdieres på.
 * @returns {*}
 */
const journalforingSituasjonsbetingetValidering = verdier => {
  const { journalforingHensikt } = verdier;

  switch (journalforingHensikt) {
    case Konstanter.JOURNALFORING_HENSIKT.OPPRETT:
      return journalforingOpprettSakValidering(verdier);
    case Konstanter.JOURNALFORING_HENSIKT.KNYTT:
      return journalforingTilknyttSakValidering(verdier);
    default: return {};
  }
};

/** Samle alle valideringsregler som feedes inn til Redux Form.
 * @param verdier {object} Verdiene som skal valideres.
 * @returns {{brukerID: (*|string|boolean), avsenderID: (*|string|boolean), dokumentTittel: (*|boolean), vedleggsTitler: *}}
 */
const journalforingValidering = verdier => ({
  ...journalforingGenerellValidering(verdier),
  ...journalforingSituasjonsbetingetValidering(verdier),
});

/** I et par tilfeller har vi en race condition hvor props ikke
 * oppdateres raskt nok til å kunne intercepte en submit. Derfor trenger vi
 * en funksjon som kjører en validering med riktig HENSIKT før denne
 * er oppdatert i Redux. Denne påvirker i seg selv ikke UI, men returnerer kun en
 * true | false.
 * @param verdier
 * @param journalforingHensikt
 * @returns {boolean}
 */
const erSkjemaGyldig = (verdier, journalforingHensikt) => {
  const verdiKopi = { ...verdier, journalforingHensikt };
  const validering = journalforingValidering(verdiKopi);
  return Object.values(validering).every(enkeltValidering => enkeltValidering === false);
};

export { journalforingValidering, erSkjemaGyldig };

