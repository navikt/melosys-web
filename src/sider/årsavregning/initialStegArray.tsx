import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { VurderingInngang } from "./stegKomponenter/vurderingInngang/vurderingInngang";

const initialInngangSteg = {
  id: "Inngang",
  tittel: "Årsavregning",
  stegPosisjon: 0,
  status: FANE_STATUS.AKTIV,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingInngang,
};

export const alleSteg = [initialInngangSteg];
