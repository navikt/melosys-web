import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingYrkesaktivitet, { VurderingYrkesaktivitetTyper } from '../../vurderinger/vurderingYrkesaktivitet';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class Yrkesaktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'ansattISektor ER LIK "OFFENTLIG"',
        exec: ({ ansattISektor }) => ansattISektor === VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER,
        nesteSteg: STEG.TJENESTEMANN,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "YRKESAKTIV" OG ansattISektor ER LIK "SOKKEL"',
        exec: ({ sysselsettingType, ansattISektor }) => (
          sysselsettingType === VurderingSysselsettingTyper.YRKESAKTIV &&
          ansattISektor === VurderingYrkesaktivitetTyper.ORDINAER_OG_SELVSTENDIG
        ),
        nesteSteg: STEG.AKTIVITET,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "YRKESAKTIV"',
        exec: ({ sysselsettingType, yrkesaktivitetType }) => (
          sysselsettingType === VurderingSysselsettingTyper.YRKESAKTIV &&
          yrkesaktivitetType === VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER
        ),
        nesteSteg: STEG.FORUTGAENDE_MEDLEMSKAP,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.YRKESAKTIVITET;
    this._tittel = 'Yrkes-aktivitet';
    this._komponent = VurderingYrkesaktivitet;
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

export default Yrkesaktivitet;
