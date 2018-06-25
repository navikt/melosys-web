import Opphold from './opphold/index';
import Studier from './studier/index';

class Regler {
  constructor(skjema) {
    this.skjema = skjema;
  }

  opphold = () => new Opphold(this.skjema);
  studier = () => new Studier(this.skjema);
}

export default Regler;
