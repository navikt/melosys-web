import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { STEG, FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import VurderingGodkjennUtpekingAnnetLand from "../../stegKomponenter/vurderingGodkjennUtpekingAnnetLand/vurderingGodkjennUtpekingAnnetLand";

class GodkjennUtpekingAnnetLand extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.GODKJENN_UTPEKING_ANNET_LAND;
    this.tittel = "Godkjenn utpeking";
    this.komponent = VurderingGodkjennUtpekingAnnetLand;
    this.samleRelevanteData = (_propsLight) => ({
      overskrift: "Godkjenn utpeking",
      redigerbart: _propsLight.generiskStegRedigerbart,
      behandlingID: _propsLight.behandlingID,
    });
    this.beregnRelevantUI = (_propsLight) => ({});
    this.handlers = {
      lagreOgGodkjennUnntaksperioder: propsLight.tilgjengeligeHandlers.lagreOgGodkjennUnntaksperioder,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default GodkjennUtpekingAnnetLand;
