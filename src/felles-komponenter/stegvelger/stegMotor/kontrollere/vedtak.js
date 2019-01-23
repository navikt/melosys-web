import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVedtak from '../../stegKomponenter/vurderingVedtak';

class Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this._id = STEG.VEDTAK;
    this._tittel = 'Vedtak';
    this._komponent = VurderingVedtak;
    this._samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Vedtak;
