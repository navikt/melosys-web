import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingFtrlVurdering from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingFtrlVurdering';

class Ftrl_Vurdering extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = false;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.FTRL_VIRKSOMHET,
      },
    ];
    this.id = STEG.FTRL_VURDERING;
    this.tittel = 'Vurdering';
    this.komponent = VurderingFtrlVurdering;
    this.samleRelevanteData = _propsLight => ({});
    this.beregnRelevantUI = _propsLight => ({ harAvklaring: false });
    this.handlers = {};
    this.status = FANE_STATUS.OK;
  }
}
export default Ftrl_Vurdering;
