import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel13_x_vedtak from "../../stegKomponenter/vurderingArtikkel13_x_vedtak/vurderingArtikkel13_x_vedtak";

class Artikkel13_4_vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.ARTIKKEL_13_4_VEDTAK;
    this.tittel = "Vedtak";
    this.komponent = VurderingArtikkel13_x_vedtak;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
      harFeilmeldinger: _propsLight.harFeilmeldinger,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      overskrift: "Omfattet av norsk lovgivning etter artikkel 13 nr. 4",
    });
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      lagreLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.lagreLovvalgsperioder,
      kontrollerFerdigbehandling: this._propsLight.tilgjengeligeHandlers.kontrollerFerdigbehandling,
      validerMottatteOpplysninger: this._propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel13_4_vedtak;
