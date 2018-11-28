import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSysselsetting, { VurderingSysselsettingTyper } from '../../stegKomponenter/vurderingSysselsetting';

class Sysselsetting extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this._kriterier = [
      {
        beskrivelse: 'sysselsettingType ER LIK "YRKESAKTIV"',
        exec: avklartefakta => Sysselsetting.finnAvklaring(avklartefakta, VurderingSysselsettingTyper.YRKESAKTIV),
        nesteSteg: STEG.YRKESAKTIVITET_ANTALL_LAND,
      },
      {
        beskrivelse: 'sysselsettingType ER LIK "YRKESAKTIV"',
        exec: avklartefakta => Sysselsetting.finnAvklaring(avklartefakta, VurderingSysselsettingTyper.YRKESAKTIV_SOKKEL_SKIP),
        nesteSteg: STEG.SOKKEL_SKIP,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.SYSSELSETTING;
    this._tittel = 'Aktivitet';
    this._komponent = VurderingSysselsetting;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = _propsLight => {
      const { sysselsetting } = _propsLight.skjema.avklartefakta;
      return ({
        harAvklaring: sysselsetting !== null && sysselsetting !== undefined,
      });
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.SYSSELSETTING);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default Sysselsetting;
