import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSektor, { VurderingSektorTyper } from '../../vurderinger/vurderingSektor';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Sektor extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'ansattISektor ER LIK "OFFENTLIG"',
        exec: ({ ansattISektor }) => ansattISektor === VurderingSektorTyper.OFFENTLIG,
        nesteSteg: STEG.TJENESTEMANN,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG ansattISektor ER LIK "SOKKEL"',
        exec: ({ sysselsettingType, ansattISektor }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingSektorTyper.SOKKEL
        ),
        nesteSteg: STEG.AKTIVITET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.FORUTGAENDE_MEDLEMSKAP,
      },
    ];
    this._id = STEG.SEKTOR;
    this._tittel = 'Type aktivitet';
    this._komponent = VurderingSektor;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = () => ({
      visAnsattISektor: true,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Sektor;
