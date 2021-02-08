import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";
import VurderingFamilie from "../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingFamilie";

class Familie extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = propsLight.vurder_familie_valid;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VEDTAK_FTRL,
      },
    ];
    this.id = STEG.FAMILIE;
    this.tittel = "Familie";
    this.komponent = VurderingFamilie;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Familie;
