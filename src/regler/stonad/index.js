import DomeneRegel from '../domeneRegel';

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
class Stonad extends DomeneRegel {
  mottarEOSBarnetrygdFraNav = () => {
    const { saksopplysninger } = this;
    const { eosBarnetrygd } = saksopplysninger.sakOgBehandling;

    const manglerInfoTekst = 'Sjekk om søker har en EØS barnetrygd-sak!';
    const positivTekst = 'Har sak på EU/EØS barnetrygd fra Nav.';
    const negativTekst = 'Har IKKE sak på EU/EØS barnetrygd fra Nav.';

    const harMangelfulleOpplysninger = (eosBarnetrygd === null || eosBarnetrygd === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger(manglerInfoTekst); }

    return this.byggRegelSvar(eosBarnetrygd, positivTekst, negativTekst);
  }
}

export default Stonad;
