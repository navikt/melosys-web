import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { STEG, FANE_STATUS } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingGodkjennUtpekingAnnetLand from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingGodkjennUtpekingAnnetLand';

class GodkjennUtpekingAnnetLand extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.GODKJENN_UTPEKING_ANNET_LAND;
    this.tittel = 'Godkjenn utpeking';
    this.komponent = VurderingGodkjennUtpekingAnnetLand;
    this.samleRelevanteData = _propsLight => ({
      overskrift: 'Godkjenn utpeking',
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({});
    this.handlers = {
      lagreOgGodkjennUnntaksperioder: propsLight.tilgjengeligeHandlers.lagreOgGodkjennUnntaksperioder,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default GodkjennUtpekingAnnetLand;
