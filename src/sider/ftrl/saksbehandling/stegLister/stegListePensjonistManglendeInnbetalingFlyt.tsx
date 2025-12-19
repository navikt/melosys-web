import { FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import { VurderingInngang } from "../stegKomponenter/vurderingInngang/vurderingInngang";
import { VurderingPerioder } from "../stegKomponenter/vurderingPeriode/vurderingPerioder";
import { VurderingBestemmelse } from "../stegKomponenter/vurderingBestemmelse/vurderingBestemmelse";
import { VurderingTrygdeavgift } from "../../../vurderingTrygdeavgift/vurderingTrygdeavgift";
import { VurderingVedtak } from "../stegKomponenter/vurderingVedtak/vurderingVedtak";
import { VurderingInngangManglendeInnbetaling } from "../stegKomponenter/vurderingInngangManglendeInnbetaling/vurderingInngangManglendeInnbetaling";
import { VurderingVedtakOpphoer } from "../stegKomponenter/vurderingVedtakOpphoer/vurderingVedtakOpphoer";

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

const bestemmelseSteg = {
  id: "Bestemmelse",
  tittel: "Bestemmelse",
  stegPosisjon: 2,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingBestemmelse,
};

const periodeSteg = {
  id: "Perioder",
  tittel: "Perioder",
  stegPosisjon: 3,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingPerioder,
};

const trygdeavgiftSteg = {
  id: "Trygdeavgift",
  tittel: "Trygdeavgift",
  stegPosisjon: 4,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingTrygdeavgift,
};

const vedtakSteg = {
  id: "Vedtak",
  tittel: "Vedtak",
  stegPosisjon: 5,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtak,
};

const stegPensjonistDelvisManglendeInnbetaling = [
  inngangSteg,
  bestemmelseSteg,
  periodeSteg,
  trygdeavgiftSteg,
  vedtakSteg,
];

export const vedtakOpphoerSteg = {
  id: "VedtakOpphoer",
  tittel: "Vedtak",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingVedtakOpphoer,
};

const stegFullstendigManglendeInnbetaling = [vedtakOpphoerSteg];

export const alleStegPensjonistManglendeInnbetalingFlyt = [
  inngangManglendeInnbetalingSteg,
  ...stegPensjonistDelvisManglendeInnbetaling,
  ...stegFullstendigManglendeInnbetaling,
];
