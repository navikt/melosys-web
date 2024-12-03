import Registrering from "../registrering";
import Saksopplysninger from "./saksopplysninger";

export default function (props) {
  return <Registrering Saksopplysninger={Saksopplysninger} {...props} />;
}
