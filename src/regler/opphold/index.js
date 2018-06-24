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

  erINorgeSeksManederEllerMerPerKalenderAr = () => {
    const { skjema } = this;
    const antallMaanederINorge = parseInt(skjema.antallMaanederINorge, 10);
    return antallMaanederINorge >= 6;
  }

  forutgaendeBostedINorge = () => {
    const { skjema } = this;
    const { forutgaendeBostedINorge } = skjema;

    return strengTilBool(forutgaendeBostedINorge) === true;
  }

  intensjonOmReturTilNorge = () => {
    if (this.skjema.intensjonOmRetur === undefined) { return undefined; }
    return strengTilBool(this.skjema.intensjonOmRetur);
  }
}

export default Opphold;
