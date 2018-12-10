import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingAktivitet from '../../stegKomponenter/vurderingAktivitet';

class Aktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.YRKESGRUPPE;
    this._tittel = 'Aktivitet';
    this._komponent = VurderingAktivitet;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Aktivitet;
