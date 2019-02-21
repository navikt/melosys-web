import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel16 from '../../stegKomponenter/vurderingArtikkel16';

class Artikkel16 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.ARTIKKEL_16;
    this._tittel = 'Artikkel 16.1';
    this._komponent = VurderingArtikkel16;
    this._samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      oppdaterOgLagreBehandlinger: this._propsLight.tilgjengeligeHandlers.oppdaterOgLagreBehandlinger,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel16;
