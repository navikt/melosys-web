import DomeneRegel from '../domeneRegel';

class Stonad extends DomeneRegel {
  mottarEOSBarnetrygdFraNav = () => {
    const { saksopplysninger } = this;
    const { eosBarnetrygd } = saksopplysninger.sakOgBehandling;

    const manglerInfoTekst = 'Sjekk om søker har en EØS barnetrygd-sak!';
    const positivTekst = 'Har sak på EU/EØS barnetrygd fra Nav.';
    const negativTekst = 'Har sak på EU/EØS barnetrygd fra Nav.';

    const harMangelfulleOpplysninger = (eosBarnetrygd === null || eosBarnetrygd === undefined);
    if (harMangelfulleOpplysninger) { return this.manglerOpplysninger({ tekst: manglerInfoTekst, status: undefined }); }

    return this.byggRegelSvar(eosBarnetrygd, positivTekst, negativTekst);
  }
}

export default Stonad;
