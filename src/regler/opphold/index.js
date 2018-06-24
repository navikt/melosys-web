import DomeneRegel from '../domeneRegel';
import { strengTilBool } from '../../utils/streng';

import { datoDiff, formatterDatoTilISO } from '../../utils/dato';

class Opphold extends DomeneRegel {
  inntilTolvManeder = () => {
    const { skjema } = this;
    const { oppholdUtlandFom, oppholdUtlandTom } = skjema;
    const isoFom = formatterDatoTilISO(oppholdUtlandFom);
    const isoTom = formatterDatoTilISO(oppholdUtlandTom);

    return datoDiff(isoFom, isoTom, 'months') < 12;
  }

  intensjonOmReturTilNorge = () => {
    if (this.skjema.intensjonOmRetur === undefined) { return undefined; }
    return strengTilBool(this.skjema.intensjonOmRetur);
  }
}

export default Opphold;
