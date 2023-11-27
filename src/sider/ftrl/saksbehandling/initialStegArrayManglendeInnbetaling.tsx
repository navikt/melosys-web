import { FANE_STATUS } from "../../../felleskomponenter/stegvelger";
import { VurderingInngang } from "./stegKomponenter/vurderingInngang";
import { VurderingVirksomhet } from "./stegKomponenter/vurderingVirksomhet";
import { VurderingPerioder } from "./stegKomponenter/vurderingPeriode/vurderingPerioder";
import { VurderingBestemmelse } from "./stegKomponenter/vurderingBestemmelse/vurderingBestemmelse";
import { VurderingTrygdeavgift } from "./stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";
import { VurderingVedtak } from "./stegKomponenter/vurderingVedtak";
import { VurderingInngangManglendeInnbetaling } from "./stegKomponenter/vurderingInngangManglendeInnbetaling";
import { VurderingVedtakOpphoer } from "./stegKomponenter/vurderingVedtakOpphoer";

const inngangManglendeInnbetalingSteg = {
  id: "ManglendeInnbetalingInngang",
  tittel: "Manglende innbetaling",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingInngangManglendeInnbetaling,
};

export const inngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingInngang,
};

const virksomhetSteg = {
  id: "Virksomhet",
  tittel: "Virksomhet",
  stegPosisjon: 2,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingVirksomhet,
};

const bestemmelseSteg = {
  id: "Bestemmelse",
  tittel: "Bestemmelse",
  stegPosisjon: 3,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingBestemmelse,
};

const periodeSteg = {
  id: "Perioder",
  tittel: "Perioder",
  stegPosisjon: 4,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingPerioder,
};

const trygdeavgiftSteg = {
  id: "Trygdeavgift",
  tittel: "Trygdeavgift",
  stegPosisjon: 5,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingTrygdeavgift,
};

const vedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 6,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

export const vedtakOpphoerSteg = {
  id: "VedtakOpphoer",
  tittel: "Vedtak",
  stegPosisjon: 7,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtakOpphoer,
};

export const alleStegManglendeInnbetaling = [
  inngangManglendeInnbetalingSteg,
  inngangSteg,
  virksomhetSteg,
  bestemmelseSteg,
  periodeSteg,
  trygdeavgiftSteg,
  vedtakSteg,
  vedtakOpphoerSteg,
];
