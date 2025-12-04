import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel16Vedtak from "../../stegKomponenter/vurderingArtikkel16Vedtak/vurderingArtikkel16Vedtak";

class Artikkel16Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.ARTIKKEL_16_VEDTAK;
    this.tittel = "Vedtak unntaks\u00ADbestemmelse";
    this.komponent = VurderingArtikkel16Vedtak;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
      harFeilmeldinger: _propsLight.harFeilmeldinger,
    });
    this.beregnRelevantUI = (_propsLight) => ({});
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      validerMottatteOpplysninger: propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16Vedtak;
