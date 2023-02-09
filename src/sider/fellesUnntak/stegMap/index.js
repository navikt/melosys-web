import { STEG } from "../../../felleskomponenter/stegvelger";
import Inngang from "./Inngang";
import RegistrerUnntaksperiode from "./registreringUnntaksperiode";

export const stegMap = new Map([
  [STEG.INNGANG, Inngang],
  [STEG.REGISTRER_UNNTAKSPERIODE, RegistrerUnntaksperiode],
]);
