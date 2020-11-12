import { GeneriskAdresse, MidlertidigAdresse, UstrukturertAdresse } from './adresse';
import { Periode } from './periode';

type Personhistorikk = {
  bostedsadressePerioder: {
    bostedsadresse: GeneriskAdresse,
    periode: Periode,
  }[],
  postadressePerioder: {
    postadresse: UstrukturertAdresse,
    periode: Periode,
  }[],
  midlertidigAdressePerioder: {
    midlertidigAdresse: MidlertidigAdresse,
    periode: Periode,
  }[],
};

export default Personhistorikk;
