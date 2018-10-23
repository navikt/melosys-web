import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingInngang from '../../stegKomponenter/vurderingInngang';

class Inngang extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this._kriterier = [
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.SYSSELSETTING,
      },
    ];
    this._id = STEG.INNGANG;
    this._tittel = 'Inngang';
    this._komponent = VurderingInngang;
    this._samleRelevanteData = props => ({
      inngangsvilkar: props.inngang,
      begrunnelser: props.begrunnelser,
      alleLandKoder: props.landkoder,
      avklartefakta: props.avklartefakta,
    });
    this._beregnRelevantUI = () => ({});
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Inngang;
