import Opphold from './opphold/index';
import Studier from './studier/index';
import Stonad from './stonad/index';

class Regler {
  constructor(skjema) {
    this.skjema = skjema;
  }

  opphold = () => new Opphold(this.skjema);
  studier = () => new Studier(this.skjema);
  stonad = () => new Stonad(this.skjema);
}

export default Regler;
