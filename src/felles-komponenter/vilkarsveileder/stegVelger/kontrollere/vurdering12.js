import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArtikkel12 from '../../vurderinger/vurderingArtikkel12';

class Vurdering12 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.VURDERING_12;
    this._tittel = 'Vurdering av 12.1';
    this._komponent = VurderingArtikkel12;
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.artikkel12_1 || [],
    });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Vurdering12;
