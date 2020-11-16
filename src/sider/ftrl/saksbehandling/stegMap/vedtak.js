import Steg from '../../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVedtak from '../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingVedtak';

class Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.VEDTAK_FTRL;
    this.tittel = 'Vedtak';
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = _propsLight => ({});
    this.beregnRelevantUI = _propsLight => ({ harAvklaring: false });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Vedtak;
