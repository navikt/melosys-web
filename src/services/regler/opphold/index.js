import moment from 'moment';

class Opphold {
  constructor (skjema) {
    this.skjema = skjema;
  }

  inntilTolvManeder = () => {
    const { skjema } = this;
    const datoFom = moment(skjema.oppholdUtlandFom, 'DD.MM.YYYY');
    const datoTom = moment(skjema.oppholdUtlandTom, 'DD.MM.YYYY');
    const oppholdsDiff = datoTom.diff(datoFom, 'months');
    if (Number.isNaN(oppholdsDiff)) { return undefined; }
    return oppholdsDiff < 12;
  }
}

export default Opphold;
