import DomeneRegel from '../domeneRegel';
import { strengTilBool } from '../../utils/streng';

import { datoDiff } from '../../utils/dato';

class Opphold extends DomeneRegel {
  inntilTolvManeder = () => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;

    return datoDiff(oppholdUtlandFom, oppholdUtlandTom, 'months') < 12;
  }

  intensjonOmReturTilNorge = () => {
    if (this.skjema.intensjonOmRetur === undefined) { return undefined; }
    return strengTilBool(this.skjema.intensjonOmRetur);
  }
}

export default Opphold;
