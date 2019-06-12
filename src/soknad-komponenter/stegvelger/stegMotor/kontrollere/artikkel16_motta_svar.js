import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16MottaSvar from '../../stegKomponenter/vurderingArtikkel16MottaSvar';

class Artikkel16MottaSvar extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'Artikkel 16 vedtak',
        exec: () => true,
        nesteSteg: STEG.ARTIKKEL_16_VEDTAK,
      },
    ];
    this.id = STEG.ARTIKKEL_16_MOTTA_SVAR;
    this.tittel = 'Artikkel 16.1 Svar';
    this.komponent = VurderingArtikkel16MottaSvar;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16MottaSvar;
