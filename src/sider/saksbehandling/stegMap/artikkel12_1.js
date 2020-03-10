import MKV from '../../../melosyskodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingArtikkel12_1 from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArtikkel12_1';
import { erVilkarOppfylt, hentVilkar } from '../../../regler/vilkar';
import * as Utils from '../../../utils';

class Artikkel12_1 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art12_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART12_1, propsLight.vilkar);
    const art16_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);

    const art12_eller_16_er_ikke_nil = !Utils._isNil(art12_1.oppfylt) || !Utils._isNil(art16_1.oppfylt);
    const manglerBegrunnelse12 = art12_1.oppfylt === false && art12_1.begrunnelseKoder.length === 0;
    const manglerBegrunnelse16 = art16_1.oppfylt === false && art16_1.begrunnelseKoder.length === 0 && art16_1.begrunnelseFritekst === null;
    const harAvklaring = art12_eller_16_er_ikke_nil && !manglerBegrunnelse12 && !manglerBegrunnelse16;

    this.kriterier = [
      {
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_1, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) && harAvklaring,
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        exec: (avklartefakta, alleVilkar) => (
          erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_1, alleVilkar) !== undefined
          && erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) !== undefined
          && harAvklaring
        ),
        nesteSteg: STEG.AVSLAG_12_X_OG_16,
      },
    ];
    this.id = STEG.ARTIKKEL_12_1;
    this.tittel = 'Vurdering av 12.1';
    this.komponent = VurderingArtikkel12_1;
    this.samleRelevanteData = _propsLight => ({
      artikkel: { kode: MKV.Koder.vilkaar.FO_883_2004_ART12_1, term: '12.1' },
      begrunnelser: _propsLight.begrunnelser.art12_1_begrunnelser || [],
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
      visBegrunnelser12: art12_1.oppfylt === false,
      visBegrunnelser16: art16_1.oppfylt === false,
      art12_1,
      art16_1,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };

    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel12_1;
