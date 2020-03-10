import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingYrkesgruppe from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingYrkesgruppe';
import * as KV from '../../../kodeverk';
import { hentFakta } from '../../../regler/avklartefakta';
import { hentTilleggBestemmelse } from '../../../regler/tilleggbestemmelser';

class Yrkesgruppe extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: avklartefakta =>
          Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER) ||
          Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL) ||
          Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12),
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: avklartefakta => Yrkesgruppe.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP),
        nesteSteg: STEG.SOKKEL_SKIP,
      },
    ];
    this.id = STEG.YRKESGRUPPE;
    this.tittel = 'Yrkes\u00ADsituasjon';
    this.komponent = VurderingYrkesgruppe;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const tilleggbestemmelse = hentTilleggBestemmelse(_propsLight.lovvalgsperioder);
      const yrkesgruppe = hentFakta(KV.Koder.avklartefaktaKoder.YRKESGRUPPE, _propsLight.avklartefakta);
      return ({
        tilleggbestemmelse,
        harAvklaring: yrkesgruppe.fakta && yrkesgruppe.fakta.length > 0,
        yrkesgruppe,
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
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === STEG.YRKESGRUPPE);
    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  }
}

export default Yrkesgruppe;
