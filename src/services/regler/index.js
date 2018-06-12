import Opphold from './opphold';

class Regler {
  constructor(skjema) {
    this.skjema = skjema;
  }

  opphold = () => new Opphold(this.skjema);
}

export default Regler;
