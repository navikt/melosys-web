import { FANE_STATUS } from "../../felleskomponenter/stegvelger";
import { VurderingInngang } from "./stegKomponenter/vurderinginngang/vurderingInngang";
import { VurderingBestemmelse } from "./stegKomponenter/vurderingbestemmelse/vurderingBestemmelse";
import { VurderingVedtak } from "./stegKomponenter/vurderingvedtak/vurderingVedtak";

const initialInngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingInngang,
};

const initialBestemmelseSteg = {
  id: "Bestemmelse",
  tittel: "Bestemmelse",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingBestemmelse,
};

const initialVedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 2,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const alleSteg = [initialInngangSteg, initialBestemmelseSteg, initialVedtakSteg];
