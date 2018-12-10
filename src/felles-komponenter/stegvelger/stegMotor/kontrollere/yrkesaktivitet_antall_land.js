import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingYrkesaktivitetAntallLand, { VurderingYrkesaktivitetAntallLandTyper } from '../../stegKomponenter/vurderingYrkesaktivitetAntallLand';
import { VurderingYrkesgruppeTyper } from '../../stegKomponenter/vurderingYrkesgruppe';
import Yrkesgruppe from '../../stegMotor/kontrollere/yrkesgruppe';

class YrkesaktivitetAntallLand extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'yrkesgruppeType ER LIK "YRKESAKTIV" OG yrkesaktivitetAntallLand ER LIK "ET_LAND_IKKE_NORGE"',
        exec: avklartefakta => (
          Yrkesgruppe.finnAvklaring(avklartefakta, VurderingYrkesgruppeTyper.ORDINAER) &&
          YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE)
        ),
        nesteSteg: STEG.ARBEIDSGIVERE,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "YRKESAKTIV_SOKKEL_SKIP" OG yrkesaktivitetAntallLand ER LIK "ET_LAND_IKKE_NORGE"',
        exec: avklartefakta => (
          Sysselsetting.finnAvklaring(avklartefakta, VurderingSysselsettingTyper.YRKESAKTIV_SOKKEL_SKIP) &&
          YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE)
        ),
        nesteSteg: STEG.ARBEIDSGIVERE,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.YRKESAKTIVITET_ANTALL_LAND;
    this._tittel = 'Arbeids\u00ADland';
    this._komponent = VurderingYrkesaktivitetAntallLand;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = _propsLight => {
      const { yrkesaktivitetAntallLand } = _propsLight.skjema.avklartefakta;
      return ({
        harAvklaring: yrkesaktivitetAntallLand !== null && yrkesaktivitetAntallLand !== undefined,
      });
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET_ANTALL_LAND);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default YrkesaktivitetAntallLand;
