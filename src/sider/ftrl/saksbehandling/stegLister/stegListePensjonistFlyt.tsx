import { FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import { VurderingInngang } from "../stegKomponenter/vurderingInngang/vurderingInngang";
import { VurderingPerioder } from "../stegKomponenter/vurderingPeriode/vurderingPerioder";
import { VurderingTrygdeavgift } from "../../../vurderingTrygdeavgift/vurderingTrygdeavgift";
import { VurderingVedtak } from "../stegKomponenter/vurderingVedtak/vurderingVedtak";
import { VurderingBestemmelse } from "../stegKomponenter/vurderingBestemmelse/vurderingBestemmelse";

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

const initialTrygdeavgiftSteg = {
  id: "Trygdeavgift",
  tittel: "Trygdeavgift",
  stegPosisjon: 3,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingTrygdeavgift,
};

const initialVedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 4,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const alleStegPensjonistFlyt = [
  initialInngangSteg,
  initialBestemmelseSteg,
  initialPeriodeSteg,
  initialTrygdeavgiftSteg,
  initialVedtakSteg,
];
