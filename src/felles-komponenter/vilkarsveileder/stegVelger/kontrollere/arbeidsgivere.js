import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingArbeidsgiver from '../../vurderinger/vurderingArbeidsgiver';

class Sysselsetting extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.SEKTOR,
      },
    ];
    this._id = STEG.ARBEIDSGIVERE;
    this._tittel = 'Arbeids\u00ADgiver';
    this._komponent = VurderingArbeidsgiver;
    this._samleRelevanteData = _propsLight => ({ arbeidsgivereIPerioden: _propsLight.arbeidsgivereIPerioden });
    this._beregnRelevantUI = _propsLight => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Sysselsetting;
