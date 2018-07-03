import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingPeriode from '../../vurderinger/vurderingPeriode';

class Periode extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.SYSSELSETTING,
      },
    ];
    this._id = STEG.PERIODE;
    this._tittel = 'Periode';
    this._komponent = VurderingPeriode;
    this._samleRelevanteData = () => ({ });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Periode;
