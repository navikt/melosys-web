import { FANE_STATUS } from "../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift } from "../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";
import VurderingOpplysninger from "./stegKomponenter/vurderingOpplysninger/vurderingOpplysninger";

const inngangSteg = {
  id: "Inngang",
  tittel: "Inngang",
  stegPosisjon: 0,
  status: FANE_STATUS.UBEHANDLET,
  aktivtSteg: true,
  vedtakSteg: false,
  komponent: VurderingOpplysninger,
};

export const alleSteg = [inngangSteg];
