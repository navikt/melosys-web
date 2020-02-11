import MKV from '../../../melosyskodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingArtikkel12_2 from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingArtikkel12_2';
import { erVilkarOppfylt, hentVilkar } from '../../../regler/vilkar';
import * as Utils from '../../../utils';

class Artikkel12_2 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art12_2 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART12_2, propsLight.vilkar);
    const art16_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);

    const art12_eller_16_er_ikke_nil = !Utils._isNil(art12_2.oppfylt) || !Utils._isNil(art16_1.oppfylt);
    const manglerBegrunnelse12 = art12_2.oppfylt === false && art12_2.begrunnelseKoder.length === 0;
    const manglerBegrunnelse16 = art16_1.oppfylt === false && art16_1.begrunnelseKoder.length === 0 && art16_1.begrunnelseFritekst === null;
    const harAvklaring = art12_eller_16_er_ikke_nil && !manglerBegrunnelse12 && !manglerBegrunnelse16;

    this.kriterier = [
      {
        beskrivelse: 'vilkar for artikkel 12.2 er oppfylt',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_2, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'ønsker å vurdere 16.1',
        exec: (avklartefakta, alleVilkar) => erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) && harAvklaring,
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        beskrivelse: 'avslår søknad',
        exec: (avklartefakta, alleVilkar) => (
          erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_2, alleVilkar) !== undefined
          && erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) !== undefined
          && harAvklaring
        ),
        nesteSteg: STEG.AVSLAG_12_X_OG_16,
      },
    ];
    this.id = STEG.ARTIKKEL_12_2;
    this.tittel = 'Vurdering av 12.2';
    this.komponent = VurderingArtikkel12_2;
    this.samleRelevanteData = _propsLight => ({
      artikkel: { kode: MKV.Koder.vilkaar.FO_883_2004_ART12_2, term: '12.2' },
      begrunnelser: _propsLight.begrunnelser.art12_2_begrunnelser || [],
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
      visBegrunnelser12: art12_2.oppfylt === false,
      visBegrunnelser16: art16_1.oppfylt === false,
      art12_2,
      art16_1,
      art16_1_fritekst: art16_1.begrunnelseFritekst || '',
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel12_2;
