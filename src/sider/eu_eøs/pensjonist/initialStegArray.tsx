import { FANE_STATUS } from "../../../felleskomponenter/stegvelger";
import VurderingOpplysninger from "./stegKomponenter/vurderingOpplysninger/vurderingOpplysninger";
import VurderingBekreftelse from "./stegKomponenter/vurderingBekreftelse/vurderingBekreftelse";

const inngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingOpplysninger,
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

export const alleSteg = [inngangSteg, bekreftelseSteg];
