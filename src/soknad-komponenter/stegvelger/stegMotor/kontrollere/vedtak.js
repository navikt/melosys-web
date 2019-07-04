import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVedtak from '../../stegKomponenter/vurderingVedtak';

class Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.VEDTAK;
    this.tittel = 'Vedtak';
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Vedtak;
