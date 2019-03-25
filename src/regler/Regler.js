import OppholdRegel from './OppholdRegel';
import ArbeidRegel from './ArbeidRegel';
import StudierRegel from './StudierRegel';
import StonadRegel from './StonadRegel';

class Regler {
  constructor(skjema = {}, saksopplysninger = {}) {
    this.skjema = skjema;
    this.saksopplysninger = saksopplysninger;
  }

  opphold = () => new OppholdRegel(this.skjema);
  arbeid = () => new ArbeidRegel(this.skjema);
  studier = () => new StudierRegel(this.skjema);
  stonad = () => new StonadRegel(this.skjema, this.saksopplysninger);
}

export default Regler;
