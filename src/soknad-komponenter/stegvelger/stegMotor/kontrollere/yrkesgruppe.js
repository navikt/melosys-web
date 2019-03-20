import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingYrkesgruppe from '../../stegKomponenter/vurderingYrkesgruppe';
import * as KV from '../../../../kodeverk';

class Yrkesgruppe extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        beskrivelse: 'yrkesgruppeType ER LIK "ORDINAER"',
        exec: avklartefakta => Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER),
        nesteSteg: STEG.YRKESAKTIVITET_ANTALL_LAND,
      },
      {
        beskrivelse: 'yrkesgruppeType ER LIK "SOKKEL_ELLER_SKIP"',
        exec: avklartefakta => Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP),
        nesteSteg: STEG.SOKKEL_SKIP,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.YRKESGRUPPE;
    this.tittel = 'Yrkes\u00ADgruppe';
    this.komponent = VurderingYrkesgruppe;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const { yrkesgruppe } = _propsLight.skjema.avklartefakta;
      return ({
        harAvklaring: yrkesgruppe !== null && yrkesgruppe !== undefined,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESGRUPPE);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default Yrkesgruppe;
