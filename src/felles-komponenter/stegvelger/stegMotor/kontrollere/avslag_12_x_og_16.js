import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingAvslag12_x_og_16 from '../../stegKomponenter/vurderingAvslag12_x_og_16';


class Avslag_12_x_og_16 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.AVSLAG_12_X_OG_16;
    this._tittel = 'Avslag 12_x og 16';
    this._komponent = VurderingAvslag12_x_og_16;
    this._samleRelevanteData = _propsLight => ({
    });
    this._beregnRelevantUI = _propsLight => {
    };
    this._handlers = {
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Avslag_12_x_og_16;
