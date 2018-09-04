import DomeneRegel from '../domeneRegel';

class Stonad extends DomeneRegel {
  mottarEOSBarnetrygdFraNav = () => {
    const { saksopplysninger } = this;
    const { eosBarnetrygd } = saksopplysninger.sakOgBehandling;

    const manglerInfoTekst = 'Sjekk om søker har en EØS barnetrygd-sak!';
    const positivTekst = 'Har sak på EU/EØS barnetrygd fra Nav.';
    const negativTekst = 'Har sak på EU/EØS barnetrygd fra Nav.';

    if (eosBarnetrygd === null || eosBarnetrygd === undefined) return ({ tekst: manglerInfoTekst, status: undefined });

    return (
      {
        tekst: eosBarnetrygd ? positivTekst : negativTekst,
        status: eosBarnetrygd,
      }
    );
  }
}

export default Stonad;
