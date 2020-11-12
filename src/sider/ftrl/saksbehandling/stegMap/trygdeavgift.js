import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingTrygdeavgift from "../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingTrygdeavgift";

class Trygdeavgift extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = false;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.REPRESENTANT,
      },
    ];
    this.id = STEG.TRYGDEAVGIFT;
    this.tittel = 'Trygdeavgift';
    this.komponent = VurderingTrygdeavgift;
    this.samleRelevanteData = _propsLight => ({});
    this.beregnRelevantUI = _propsLight => ({ harAvklaring: false });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Trygdeavgift;
