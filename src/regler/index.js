import Opphold from './opphold/index';
import Arbeid from './arbeid/index';
import Studier from './studier/index';
import Stonad from './stonad/index';

class Regler {
  constructor(skjema = {}, saksopplysninger = {}) {
    this.skjema = skjema;
    this.saksopplysninger = saksopplysninger;
  }

  opphold = () => new Opphold(this.skjema);
  arbeid = () => new Arbeid(this.skjema);
  studier = () => new Studier(this.skjema);
  stonad = () => new Stonad(this.skjema, this.saksopplysninger);
}

export default Regler;
