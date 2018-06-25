import DomeneRegel from '../domeneRegel';

import { strengTilBool } from '../../utils/streng';

class Stonad extends DomeneRegel {
  mottarEOSBarnetrygdFraNav = () => {
    const { skjema } = this;
    const { EOSBarnetrygdFraNAV } = skjema;

    return strengTilBool(EOSBarnetrygdFraNAV);
  }
}

export default Stonad;
