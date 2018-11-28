import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingSokkelSkip, { VurderingSokkelSkipTyper } from '../../stegKomponenter/vurderingSokkelSkip';

class SokkelSkip extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this._kriterier = [
      {
        beskrivelse: 'sokkelSkipType ER LIK "YRKESAKTIV"',
        exec: avklartefakta => SokkelSkip.finnAvklaring(avklartefakta, VurderingSokkelSkipTyper.YRKESAKTIV),
        nesteSteg: STEG.YRKESAKTIVITET_ANTALL_LAND,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.SOKKEL_SKIP;
    this._tittel = 'Sokkel / skip';
    this._komponent = VurderingSokkelSkip;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = _propsLight => {
      const { sokkelSkip } = _propsLight.skjema.avklartefakta;
      return ({
        harAvklaring: sokkelSkip !== null && sokkelSkip !== undefined,
      });
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.SokkelSkip);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default SokkelSkip;
