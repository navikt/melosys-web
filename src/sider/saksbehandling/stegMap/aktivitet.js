import Steg from '../komponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../komponenter/stegvelger/stegMotor/typer';
import VurderingAktivitet from '../komponenter/stegvelger/stegKomponenter/vurderingAktivitet';

class Aktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.YRKESGRUPPE;
    this.tittel = 'Aktivitet';
    this.komponent = VurderingAktivitet;
    this.samleRelevanteData = () => ({});
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Aktivitet;
