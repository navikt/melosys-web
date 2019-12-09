import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingVideresend from '../../stegKomponenter/vurderingVideresend';

class Videresend extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: '',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this.id = STEG.VIDERESEND;
    this.tittel = 'Videresending av søknad';
    this.komponent = VurderingVideresend;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({});
    this.handlers = {
      videresendSoknad: this._propsLight.tilgjengeligeHandlers.videresendSoknad,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Videresend;
