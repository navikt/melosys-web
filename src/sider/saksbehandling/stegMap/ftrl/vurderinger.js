import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVurdering from '../../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVurdering';

class Vurdering extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = false;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ];
    this.id = STEG.VURDERING;
    this.tittel = 'Vurdering';
    this.komponent = VurderingVurdering;
    this.samleRelevanteData = _propsLight => ({});
    this.beregnRelevantUI = _propsLight => ({ harAvklaring: false });
    this.handlers = {};
    this.status = FANE_STATUS.OK;
  }
}
export default Vurdering;
