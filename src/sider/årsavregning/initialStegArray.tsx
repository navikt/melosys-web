import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { VurderingInngang } from "./stegKomponenter/vurderingInngang/vurderingInngang";
import { VurderingVedtak } from "./stegKomponenter/vurderingVedtak/vurderingVedtak";

const initialInngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingInngang,
};

const initialVedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const alleSteg = [initialInngangSteg, initialVedtakSteg];
