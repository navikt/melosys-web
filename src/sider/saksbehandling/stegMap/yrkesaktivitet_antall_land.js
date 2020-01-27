import Steg from '../komponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../komponenter/stegvelger/stegMotor/typer';
import VurderingYrkesaktivitetAntallLand from '../komponenter/stegvelger/stegKomponenter/vurderingYrkesaktivitetAntallLand';
import * as KV from '../../../kodeverk';
import Yrkesgruppe from './yrkesgruppe';
import { hentFakta } from '../../../regler/avklartefakta';

class YrkesaktivitetAntallLand extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'yrkesgruppeType ER LIK "ORDINAER" OG yrkesaktivitetAntallLand ER LIK "ET_LAND_IKKE_NORGE"',
        exec: avklartefakta => (
          (Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER) ||
          Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL)) &&
          YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE)
        ),
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        beskrivelse: 'yrkesgruppeType ER LIK "YRKESAKTIV_SOKKEL_SKIP" OG yrkesaktivitetAntallLand ER LIK "ET_LAND_IKKE_NORGE"',
        exec: avklartefakta => (
          Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP) &&
          YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE)
        ),
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        beskrivelse: 'yrkesgruppeType ER LIK "ORDINAER" OG yrkesaktivitetAntallLand ER LIK "TO_ELLER_FLERE_LAND"',
        exec: avklartefakta => (
          (Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER) ||
          Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL)) &&
          YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND)
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this.id = STEG.YRKESAKTIVITET_ANTALL_LAND;
    this.tittel = 'Antall <br> land';
    this.komponent = VurderingYrkesaktivitetAntallLand;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const yrkesaktivitetAntallLand = hentFakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND, _propsLight.avklartefakta);
      return ({
        harAvklaring: yrkesaktivitetAntallLand.fakta && yrkesaktivitetAntallLand.fakta.length > 0,
        yrkesaktivitetAntallLand,
      });
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default YrkesaktivitetAntallLand;
