import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel13_x_vedtak from '../../stegKomponenter/vurderingArtikkel13_x_vedtak';

class Artikkel13_1_b_vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.ARTIKKEL_13_1_B_VEDTAK;
    this.tittel = 'Vedtak';
    this.komponent = VurderingArtikkel13_x_vedtak;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      overskrift: 'Omfattet av norsk lovgivning, etter artikkel 13, nr. 1, b',
    });
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      lagreLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.lagreLovvalgsperioder,
      byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel13_1_b_vedtak;
