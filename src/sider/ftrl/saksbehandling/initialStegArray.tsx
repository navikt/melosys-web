import { FANE_STATUS } from "../../../felleskomponenter/stegvelger";
import { VurderingInngang } from "./stegKomponenter/vurderingInngang";
import { VurderingVirksomhet } from "./stegKomponenter/vurderingVirksomhet";
import { VurderingPerioder } from "./stegKomponenter/vurderingPeriode/vurderingPerioder";
import { VurderingBestemmelse } from "./stegKomponenter/vurderingBestemmelse/vurderingBestemmelse";
import { VurderingTrygdeavgiftGammel } from "./stegKomponenter/vurderingTrygdeavgiftGammel";
import { VurderingTrygdeavgift } from "./stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";
import { VurderingVedtak } from "./stegKomponenter/vurderingVedtak";

const initialInngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingInngang,
};

const initialVirksomhetSteg = {
  id: "Virksomhet",
  tittel: "Virksomhet",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingVirksomhet,
};

const initialBestemmelseSteg = {
  id: "Bestemmelse",
  tittel: "Bestemmelse",
  stegPosisjon: 2,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingBestemmelse,
};

const initialPeriodeSteg = {
  id: "Perioder",
  tittel: "Perioder",
  stegPosisjon: 3,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingPerioder,
};

const initialTrygdeavgiftSteg = {
  id: "Trygdeavgift",
  tittel: "Trygdeavgift",
  stegPosisjon: 4,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingTrygdeavgift,
};

const initialTrygdeavgiftStegGammel = {
  id: "Trygdeavgift",
  tittel: "Trygdeavgift",
  stegPosisjon: 4,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingTrygdeavgiftGammel,
};

const initialVedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 5,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const alleSteg = [
  initialInngangSteg,
  initialVirksomhetSteg,
  initialBestemmelseSteg,
  initialPeriodeSteg,
  initialTrygdeavgiftSteg,
  initialVedtakSteg,
];

export const alleStegGammel = [
  initialInngangSteg,
  initialVirksomhetSteg,
  initialBestemmelseSteg,
  initialPeriodeSteg,
  initialTrygdeavgiftStegGammel,
  initialVedtakSteg,
];
