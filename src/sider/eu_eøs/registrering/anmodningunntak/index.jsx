import Registrering from "../registrering";
import Saksopplysninger from "./saksopplysninger";

function AnmodningUnntak(props) {
  return <Registrering Saksopplysninger={Saksopplysninger} {...props} />;
}

export default AnmodningUnntak;
