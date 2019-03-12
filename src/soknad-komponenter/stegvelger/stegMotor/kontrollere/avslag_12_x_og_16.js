import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingAvslag12_x_og_16 from '../../stegKomponenter/vurderingAvslag12_x_og_16';


class Avslag_12_x_og_16 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.AVSLAG_12_X_OG_16;
    this.tittel = 'Vedtak';
    this.komponent = VurderingAvslag12_x_og_16;
    this.samleRelevanteData = _propsLight => ({
      fattVedtak: _propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    });
    this.beregnRelevantUI = _propsLight => {
    };
    this.handlers = {
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Avslag_12_x_og_16;
