import * as Dato from './generisk/dato';
import * as Konstanter from '../../../constants';
import * as Mikrovalidering from './mikrovalidering';
/** Mikrovalidering pr hendelse. Dette gjør at vi kan både kan spisse tekstlig tilbakemelding
 * og validere på tvers av verdier.
 */

const dokumentTittelErBlank = dokumentTittel => (!dokumentTittel || dokumentTittel.length === 0 ? { melding: 'Velg dokumenttittel fra listen eller skriv din egen.' } : undefined);
const eksisterendeSakIkkeValgt = saksnummer => (!saksnummer ? { melding: 'Velg hvilken sak du ønsker å knytte journalføringen mot.' } : undefined);
const datoErIkkeGyldig = dato => (!Dato.datoErGyldig(dato) ? { melding: 'Skriv inn en gyldig dato' } : undefined);
const datoErBlank = dato => ((!dato || dato === '') ? { melding: 'Tast inn dato' } : undefined);
const landErIkkeValgt = (landListe = []) => (landListe.length === 0 ? { melding: 'Velg minst ett land.' } : undefined);

const validerAvsenderID = verdier => {
  if (verdier.erBrukerAvsender) return undefined;
  if (Mikrovalidering.idErBlank(verdier.avsenderID)) return undefined;

  return (
    Mikrovalidering.idErIkkeNummer(verdier.avsenderID) ||
    Mikrovalidering.idErIkkeFnrEllerDnrEllerOrgnr(verdier.avsenderID) ||
    Mikrovalidering.idFinnesIkke(verdier.avsenderNavn, verdier.avsenderID) ||
    undefined
  );
};

const validerRepresentantID = verdier => {
  if (Mikrovalidering.idErBlank(verdier.representantID)) return undefined;

  return (
    Mikrovalidering.idErIkkeOrgnr(verdier.representantID) ||
    Mikrovalidering.idFinnesIkke(verdier.representantNavn, verdier.representantID) ||
    undefined
  );
};

const validerBrukerID = verdier => (
  Mikrovalidering.idErBlank(verdier.brukerID) ||
  Mikrovalidering.idErIkkeNummer(verdier.brukerID) ||
  Mikrovalidering.idErIkkeFnrEllerDnr(verdier.brukerID) ||
  Mikrovalidering.idFinnesIkke(verdier.brukerNavn, verdier.brukerID) ||
  undefined
);

const validerAvsenderNavn = verdier => (
  Mikrovalidering.navnAvsenderErBlank(verdier.avsenderNavn) || undefined
);

const validerHovedDokumentTittel = verdier => (
  dokumentTittelErBlank(verdier.hoveddokumentTittel) || undefined
);

/** Ved å short circuite igjennom alle forutsetninger helt til den siste som returnerer false,
 * kan vi bygge opp sjekk per felt-navn. Rekkefølgen har betydning med hensyn til hvilken feilmelding
 * som er relevant. Feks: feilmelding om at et felt er tomt skal vises før feilmelding om at fødselsnummer ikke er gyldig.
 */
const journalforingGenerellValidering = verdier => ({
  brukerID: validerBrukerID(verdier),
  avsenderID: validerAvsenderID(verdier),
  avsenderNavn: validerAvsenderNavn(verdier),
  hoveddokumentTittel: validerHovedDokumentTittel(verdier),
  representantID: validerRepresentantID(verdier),
});

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
 * @returns {{journalforingPeriodeFraOgMed: (*|boolean), journalforingPeriodeTilOgMed: (*|boolean), journalforingSoknadsland: *}}
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

  const journalforingSoknadsland = (landErIkkeValgt(verdier.journalforingSoknadsland) ? { _error: landErIkkeValgt(verdier.journalforingSoknadsland) } : false);

  return {
    journalforingPeriodeFraOgMed,
    journalforingPeriodeTilOgMed,
    journalforingSoknadsland,
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

