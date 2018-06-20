import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingYrkesaktivitetFordeling, { VurderingYrkesaktivitetFordelingTyper } from '../../vurderinger/vurderingYrkesaktivitetFordeling';
import { VurderingSektorTyper } from '../../vurderinger/vurderingSektor';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';

class YrkesaktivitetFordeling extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG ansattISektor ER LIK "INGEN_AV_DISSE"  OG yrkesaktivitetFordeling ER LIK "ETT_LAND_IKKE_NORGE"',
        exec: ({ sysselsettingType, ansattISektor, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingSektorTyper.INGEN_AV_DISSE &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.ETT_LAND_IKKE_NORGE
        ),
        nesteSteg: STEG.UTSENDING,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG ansattISektor ER LIK "INGEN_AV_DISSE" OG yrkesaktivitetFordeling ER LIK "KUN_NORGE"',
        exec: ({ sysselsettingType, ansattISektor, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingSektorTyper.INGEN_AV_DISSE &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.KUN_NORGE
        ),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "SELVSTENDIG" OG yrkesaktivitetFordeling ER LIK "ETT_LAND_IKKE_NORGE"',
        exec: ({ sysselsettingType, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.ETT_LAND_IKKE_NORGE
        ),
        nesteSteg: STEG.UTSENDING,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "SELVSTENDIG" OG yrkesaktivitetFordeling ER LIK "KUN_NORGE"',
        exec: ({ sysselsettingType, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.KUN_NORGE
        ),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER_OG_SELVSTENDIG" OG yrkesaktivitetFordeling ER LIK "ETT_LAND_IKKE_NORGE"',
        exec: ({ sysselsettingType, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.ETT_LAND_IKKE_NORGE
        ),
        nesteSteg: STEG.AKTIVITET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ];
    this._id = STEG.YRKESAKTIVITET_FORDELING;
    this._komponent = VurderingYrkesaktivitetFordeling;
    this._dataHenter = () => ({ });
    this._tilstand = () => ({
      visAntallLand: true,
    });
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default YrkesaktivitetFordeling;
