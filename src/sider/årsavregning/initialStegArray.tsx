import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { VurderingAarsavregning } from "./stegKomponenter/vurderingAarsavregning/vurderingAarsavregning";

const aarsavregningSteg = {
  id: "Årsavregning",
  tittel: "Årsavregning",
  stegPosisjon: 0,
  status: FANE_STATUS.AKTIV,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingAarsavregning,
};

export const alleSteg = [aarsavregningSteg];
