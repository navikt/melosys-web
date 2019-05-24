import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingYrkesaktivitet from '../../stegKomponenter/vurderingYrkesaktivitet';
import * as KV from '../../../../kodeverk';
import { hentFakta } from '../../../../regler/avklartefakta';

class Yrkesaktivitet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'yrkesaktivitet ER LIK "ORDINAER_ARBEIDSTAKER"',
        exec: avklartefakta => Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER),
        nesteSteg: STEG.FORUTGAENDE_MEDLEMSKAP,
      },
      {
        beskrivelse: 'yrkesaktivitet ER LIK "SELVSTENDIG_NAERINGSDRIVENDE"',
        exec: avklartefakta => Yrkesaktivitet.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE),
        nesteSteg: STEG.NORMALT_DRIVER_VIRKSOMHET,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.YRKESAKTIVITET;
    this.tittel = 'Yrkes-aktivitet';
    this.komponent = VurderingYrkesaktivitet;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const yrkesaktivitet = hentFakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET, _propsLight.avklartefakta);

      return ({
        harAvklaring: yrkesaktivitet.fakta && yrkesaktivitet.fakta.length > 0,
        yrkesaktivitet,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (type, felt) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, type, felt),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default Yrkesaktivitet;
