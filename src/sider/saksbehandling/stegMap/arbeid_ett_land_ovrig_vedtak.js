import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingArbeidEttLandOvrigVedtak from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArbeidEttLandOvrigVedtak';

class ArbeidEttLandOvrigVedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];
    this.id = STEG.ARBEID_ETT_LAND_OVRIG_VEDTAK;
    this.tittel = 'Vedtak';
    this.komponent = VurderingArbeidEttLandOvrigVedtak;
    this.samleRelevanteData = () => ({});
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default ArbeidEttLandOvrigVedtak;
