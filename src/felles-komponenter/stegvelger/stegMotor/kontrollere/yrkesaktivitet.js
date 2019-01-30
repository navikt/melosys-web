import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingYrkesaktivitet from '../../stegKomponenter/vurderingYrkesaktivitet';
import { VurderingYrkesaktivitetTyper } from '../../../../kodeverk/koder';

class Yrkesaktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'yrkesaktivitet ER LIK "ORDINAER_ARBEIDSTAKER"',
        exec: avklartefakta => Yrkesaktivitet.finnAvklaring(avklartefakta, VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER),
        nesteSteg: STEG.FORUTGAENDE_MEDLEMSKAP,
      },
      {
        beskrivelse: 'yrkesaktivitet ER LIK "SELVSTENDIG_NAERINGSDRIVENDE"',
        exec: avklartefakta => Yrkesaktivitet.finnAvklaring(avklartefakta, VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE),
        nesteSteg: STEG.NORMALT_DRIVER_VIRKSOMHET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.YRKESAKTIVITET;
    this._tittel = 'Yrkes-aktivitet';
    this._komponent = VurderingYrkesaktivitet;
    this._samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = _propsLight => {
      const { yrkesaktivitet } = _propsLight.skjema.avklartefakta;

      return ({
        harAvklaring: yrkesaktivitet !== null && yrkesaktivitet !== undefined,
      });
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default Yrkesaktivitet;
