import Periode from "./periode";
import { RegisterAdresse, MidlertidigAdresse, UstrukturertAdresse } from "./adresse";

interface Personhistorikk {
  bostedsadressePerioder: {
    bostedsadresse: RegisterAdresse;
    periode: Periode;
  }[];
  postadressePerioder: {
    postadresse: UstrukturertAdresse;
    periode: Periode;
  }[];
  midlertidigAdressePerioder: {
    midlertidigAdresse: MidlertidigAdresse;
    periode: Periode;
  }[];
}

export default Personhistorikk;
