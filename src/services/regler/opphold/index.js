import moment from 'moment';
import DomeneRegel from '../domeneRegel';
import { strengTilBool } from '../../../utils/streng';

class Opphold extends DomeneRegel {
  inntilTolvManeder = () => {
    const { skjema } = this;
    const datoFom = moment(skjema.oppholdUtlandFom, 'DD.MM.YYYY');
    const datoTom = moment(skjema.oppholdUtlandTom, 'DD.MM.YYYY');
    const oppholdsDiff = datoTom.diff(datoFom, 'months');
    if (Number.isNaN(oppholdsDiff)) { return undefined; }
    return oppholdsDiff < 12;
  }

  intensjonOmReturTilNorge = () => {
    if (this.skjema.intensjonOmRetur === undefined) { return undefined; }
    return strengTilBool(this.skjema.intensjonOmRetur);
  }
}

export default Opphold;
