import DomeneRegel from '../domeneRegel';

import { strengTilBool } from '../../utils/streng';

class Stonad extends DomeneRegel {
  mottarEOSBarnetrygdFraNav = () => {
    const { skjema } = this;
    const { EOSBarnetrygdFraNAV } = skjema;

    if (!EOSBarnetrygdFraNAV) return undefined;

    return strengTilBool(EOSBarnetrygdFraNAV);
  }
}

export default Stonad;
