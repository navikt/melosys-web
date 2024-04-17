import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { Aarsavregning } from "./stegKomponenter/aarsavregning/aarsavregning";

const aarsavregningSteg = {
  id: "Årsavregning",
  tittel: "Årsavregning",
  stegPosisjon: 0,
  status: FANE_STATUS.AKTIV,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: Aarsavregning,
};

export const alleSteg = [aarsavregningSteg];
