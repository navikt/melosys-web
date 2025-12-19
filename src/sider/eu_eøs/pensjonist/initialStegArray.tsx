import { FANE_STATUS } from "../../../felleskomponenter/stegvelger";
import VurderingOpplysninger from "./stegKomponenter/vurderingOpplysninger/vurderingOpplysninger";
import VurderingBekreftelse from "./stegKomponenter/vurderingBekreftelse/vurderingBekreftelse";
import { VurderingTrygdeavgift } from "../../vurderingTrygdeavgift/vurderingTrygdeavgift";

const inngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingOpplysninger,
};

const trygdeavgiftSteg = {
  id: "Trygdeavgift",
  tittel: "Trygdeavgift",
  stegPosisjon: 1,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: false,
  komponent: VurderingTrygdeavgift,
};

const bekreftelseSteg = {
  id: "Bekreftelse",
  tittel: "Bekreftelse",
  stegPosisjon: 2,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: false,
  vedtakSteg: true,
  komponent: VurderingBekreftelse,
};

export const alleSteg = [inngangSteg, trygdeavgiftSteg, bekreftelseSteg];
