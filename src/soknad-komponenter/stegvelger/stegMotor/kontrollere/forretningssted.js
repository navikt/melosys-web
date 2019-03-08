import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingForretningssted from '../../stegKomponenter/vurderingForretningssted';

class Forretningssted extends Steg {
  constructor(avklartefakta) {
    super(avklartefakta);
    this.kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this.id = STEG.FORRETNINGSSTED;
    this.tittel = 'Forretnings\u00ADsted';
    this.komponent = VurderingForretningssted;
    this.samleRelevanteData = props => ({ valgteArbeidsforhold: props.valgteArbeidsforhold });
    this.beregnRelevantUI = () => {};
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Forretningssted;
