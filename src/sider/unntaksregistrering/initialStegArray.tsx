import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import VurderingInngang from "./vurderingInngang";
import VurderingUnntakMedlemskap from "./vurderingUnntakMedlemskap";

const initialVurderingInngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingInngang,
};

const initialVurderingUnntakMedlemskapSteg = {
  id: "Unntak medlemskap",
  tittel: "Unntak medlemskap",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingUnntakMedlemskap,
};

export const alleSteg = [initialVurderingInngangSteg, initialVurderingUnntakMedlemskapSteg];
