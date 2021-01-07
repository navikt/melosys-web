import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";
import VurderingRepresentant from "../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingRepresentant";

class Reprensentant extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = false;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.FAMILIE,
      },
    ];
    this.id = STEG.REPRESENTANT;
    this.tittel = "Representant";
    this.komponent = VurderingRepresentant;
    this.samleRelevanteData = (_propsLight) => ({});
    this.beregnRelevantUI = (_propsLight) => ({ harAvklaring: false });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Reprensentant;
