import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel13UtpekLand from '../../stegKomponenter/vurderingArtikkel13UtpekLand';

class Artikkel13_2_b_utpek_land extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'dead end',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this.id = STEG.ARTIKKEL_13_2_B_UTPEK_LAND;
    this.tittel = 'Utpek\u00ADlandet';
    this.komponent = VurderingArtikkel13UtpekLand;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      overskrift: 'Utpek land etter artikkel 13 nr. 2 bokstav b',
    });
    this.handlers = {
      lagreOgUtpek: this._propsLight.tilgjengeligeHandlers.lagreOgUtpek,
    };
    this._status = FANE_STATUS.OK;
  }
}
export default Artikkel13_2_b_utpek_land;
