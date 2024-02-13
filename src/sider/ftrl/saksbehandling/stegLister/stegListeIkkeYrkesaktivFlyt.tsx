import { FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import { VurderingInngang } from "../stegKomponenter/vurderingInngang/vurderingInngang";
import { VurderingPerioder } from "../stegKomponenter/vurderingPeriode/vurderingPerioder";
import { VurderingBestemmelse } from "../stegKomponenter/vurderingBestemmelse/vurderingBestemmelse";
import { VurderingVedtak } from "../stegKomponenter/vurderingVedtak/vurderingVedtak";

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

const initialPeriodeSteg = {
  id: "Perioder",
  tittel: "Perioder",
  stegPosisjon: 2,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingPerioder,
};

const initialVedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 3,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const alleStegIkkeYrkesaktivFlyt = [
  initialInngangSteg,
  initialBestemmelseSteg,
  initialPeriodeSteg,
  initialVedtakSteg,
];
