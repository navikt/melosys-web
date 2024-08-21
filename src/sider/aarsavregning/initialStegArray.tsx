import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { VurderingAarsavregning } from "./stegKomponenter/vurderingAarsavregning/vurderingAarsavregning";
import { VurderingVedtak } from "./stegKomponenter/vurderingVedtak/vurderingVedtak";

const aarsavregningSteg = {
  id: "Årsavregning",
  tittel: "Årsavregning",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingAarsavregning,
};

const vedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const alleSteg = [aarsavregningSteg, vedtakSteg];
