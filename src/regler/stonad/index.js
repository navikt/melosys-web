import DomeneRegel from '../domeneRegel';

class Stonad extends DomeneRegel {
  mottarEOSBarnetrygdFraNav = () => {
    const { saksopplysninger } = this;
    const { eosBarnetrygd } = saksopplysninger.sakOgBehandling;

    if (eosBarnetrygd === null) return undefined;

    return eosBarnetrygd;
  }
}

export default Stonad;
