import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForretningssted from '../../stegKomponenter/vurderingForretningssted';

class Forretningssted extends Steg {
  constructor(avklartefakta) {
    super(avklartefakta);
    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.FORRETNINGSSTED;
    this._tittel = 'Forretnings\u00ADsted';
    this._komponent = VurderingForretningssted;
    this._samleRelevanteData = props => ({ valgteArbeidsforhold: props.valgteArbeidsforhold });
    this._beregnRelevantUI = () => {};
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Forretningssted;
