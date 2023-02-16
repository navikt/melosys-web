import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { VurderingVedtak } from "../stegKomponenter/vurderingVedtak";

class Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = true;
    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.VEDTAK_FTRL;
    this.tittel = "Vedtak";
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = (_propsLight) => ({
      alleLandkoder: _propsLight.landkoder,
      redigerbart: _propsLight.redigerbart,
      harFeilmeldinger: _propsLight.harFeilmeldinger,
    });
    this.beregnRelevantUI = (_propsLight) => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
      kontrollerFerdigbehandling: this._propsLight.tilgjengeligeHandlers.kontrollerFerdigbehandling,
      validerMottatteOpplysninger: this._propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Vedtak;
