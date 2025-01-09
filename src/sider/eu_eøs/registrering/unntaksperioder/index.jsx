import Registrering from "../registrering";
import Saksopplysninger from "./saksopplysninger";

function Unntaksperioder(props) {
  return <Registrering Saksopplysninger={Saksopplysninger} {...props} />;
}

export default Unntaksperioder;
