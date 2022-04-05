import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel16Vedtak from "../../stegKomponenter/vurderingArtikkel16Vedtak";

class Artikkel16Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.ARTIKKEL_16_VEDTAK;
    this.tittel = "Artikkel 16.1 Vedtak";
    this.komponent = VurderingArtikkel16Vedtak;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
      harValgtNorskArbeidsgiver: _propsLight.harValgtNorskArbeidsgiver,
      harValideringFeil: _propsLight.harValideringFeil,
    });
    this.beregnRelevantUI = (_propsLight) => ({});
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      kontrollerVedtak: this._propsLight.tilgjengeligeHandlers.kontrollerVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16Vedtak;
