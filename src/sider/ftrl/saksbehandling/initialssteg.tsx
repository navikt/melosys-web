import { STEG } from "../../../felleskomponenter/stegvelger";
import { VurderingBestemmelse } from "./stegKomponenter/vurderingBestemmelse";
import { VurderingPerioder } from "./stegKomponenter/vurderingPerioder";
import { VurderingStart } from "./stegKomponenter/vurderingStart";
import { VurderingTrygdeavgift } from "./stegKomponenter/vurderingTrygdeavgift";
import { VurderingVedtak } from "./stegKomponenter/vurderingVedtak";
import { VurderingVirksomhet } from "./stegKomponenter/vurderingVirksomhet";

export const START = {
  navn: STEG.START,
  id: "0",
  tittel: "Start",
  vedtakSteg: false,
  nesteSteg: STEG.VIRKSOMHET,
  forrigeSteg: null,
  komponent: VurderingStart,
};
export const VIRKSOMHET = {
  navn: STEG.VIRKSOMHET,
  id: "1",
  tittel: "Virksomhet",
  vedtakSteg: false,
  nesteSteg: STEG.BESTEMMELSE,
  forrigeSteg: STEG.START,
  komponent: VurderingVirksomhet,
};
export const BESTEMMELSE = {
  navn: STEG.BESTEMMELSE,
  id: "2",
  tittel: "Bestemmelse",
  vedtakSteg: false,
  nesteSteg: STEG.PERIODER,
  forrigeSteg: STEG.VIRKSOMHET,
  komponent: VurderingBestemmelse,
};
export const PERIODER = {
  navn: STEG.PERIODER,
  id: "3",
  tittel: "Perioder",
  vedtakSteg: false,
  nesteSteg: STEG.TRYGDEAVGIFT,
  forrigeSteg: STEG.BESTEMMELSE,
  komponent: VurderingPerioder,
};
export const TRYGDEAVGIFT = {
  navn: STEG.TRYGDEAVGIFT,
  id: "4",
  tittel: "Trygdeavgift",
  vedtakSteg: false,
  nesteSteg: STEG.VEDTAK_FTRL,
  forrigeSteg: STEG.PERIODER,
  komponent: VurderingTrygdeavgift,
};
export const VEDTAK_FTRL = {
  navn: STEG.VEDTAK_FTRL,
  id: "5",
  tittel: "Vedtak",
  vedtakSteg: true,
  nesteSteg: "",
  forrigeSteg: STEG.TRYGDEAVGIFT,
  komponent: VurderingVedtak,
};
