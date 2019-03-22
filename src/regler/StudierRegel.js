import DomeneRegel from './DomeneRegel';

/** Klassen inneholder funksjoner som hver evaluerer konkrete situasjoner basert på
 * opplysninger fra søknaden, avklartefakta og fagsak. Utfallet av hver funksjon
 * kan ende i "sann", "usann" eller mangelfull opplysninger. Tekstene som også
 * returneres som en del av objektet reflekterer også dette.
 *
 * Det er klassen DomeneRegel som extendes, som håndterer selve utformingen av
 * objektene i manglerOpplysninger eller byggRegelSvar.
 *
 * Dersom en regel mangler opplysninger (som typisk er tilfelle i en papirsøknad,
 * vil følgende objekt returneres:
 * {status: undefined, tekst: 'Sjekk at xyz er tilstede'}
 *
 * Dersom regel har har nok informasjon til å evaluere vil  objekt
 * returneres med positiv eller negativ tekst. Nedenfor er eksempel på begge:
 * {status: true, tekst: 'Har forutgående bosted i Norge'}
 * {status: false, tekst: 'Har IKKE forutgående bosted i Norge'}
 */
class StudierRegel extends DomeneRegel {
  studererIUtlandet = () => {
    const { skjema } = this;
    const { oppholdsland } = skjema;

    const manglerInfoTekst = 'Sjekk om søker studerer i utlandet!';
    const positivTekst = 'Studerer i utlandet.';
    const negativTekst = 'Studerer IKKE i utlandet.';

    const harMangelfulleOpplysninger = (!oppholdsland || oppholdsland.length === 0);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    const harStudierIUtlandet = !oppholdsland.includes('NO');
    return this.byggRegelSvar(harStudierIUtlandet, positivTekst, negativTekst);
  };

  studierFinansieresFraNorge = () => {
    const { skjema } = this;
    const { studentFinansiering } = skjema;

    const manglerInfoTekst = 'Sjekk om studiet er finansiert fra Norge!';
    const positivTekst = 'Studiet er finansiert fra Norge.';
    const negativTekst = 'Studiet er IKKE finansiert fra Norge.';

    const harMangelfulleOpplysninger = (studentFinansiering === null || studentFinansiering === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    const erStudierFinansiertFraNorge = (studentFinansiering === 'LAANEKASSEN');
    return this.byggRegelSvar(erStudierFinansiertFraNorge, positivTekst, negativTekst);
  }
}

export default StudierRegel;
