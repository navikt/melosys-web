import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingEndrePeriode from '../../stegKomponenter/vurderingEndrePeriode';

class EndrePeriode extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this._id = STEG.ENDRET_PERIODE;
    this._tittel = 'Endre lovvalgsperiode';
    this._komponent = VurderingEndrePeriode;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      endrePeriode: this._propsLight.tilgjengeligeHandlers.endrePeriode,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default EndrePeriode;
