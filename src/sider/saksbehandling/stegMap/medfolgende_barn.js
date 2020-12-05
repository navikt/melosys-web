import * as KV from '../../../kodeverk';

import MKV from '../../../melosyskodeverk';

import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingMedfolgendeBarn from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingMedfolgendeBarn';
import { hentFaktaListe } from '../../../regler/avklartefakta';
import { erVilkarOppfylt } from '../../../regler/vilkar';

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const vurderingLovvalgBarnFakta = hentFaktaListe(MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN, propsLight.avklartefakta);

    const harAvklaring = this.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn);

    this.kriterier = [
      {
        exec: (avklartefakta, alleVilkar) => (
          harAvklaring && (
            erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_1, alleVilkar) ||
            erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_2, alleVilkar)
          )
        ),
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: (avklartefakta, alleVilkar) => (
          harAvklaring && erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar)
        ),
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        exec: () => harAvklaring && propsLight.erArbeidEttLandOvrig,
        nesteSteg: STEG.ARBEID_ETT_LAND_OVRIG_VEDTAK,
      },
    ];

    this.id = STEG.MEDFOLGENDE_BARN;
    this.tittel = 'Barn';
    this.komponent = VurderingMedfolgendeBarn;
    this.samleRelevanteData = _propsLight => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      vurderingLovvalgBarnFakta,
    });
    this.beregnRelevantUI = _propsLight => ({
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  harAvklaring = (vurderingLovvalgBarnFakta, behandlingsgrunnlagMedfolgendeBarn) => (
    (vurderingLovvalgBarnFakta.length === behandlingsgrunnlagMedfolgendeBarn.length) &&
    vurderingLovvalgBarnFakta.every(enkeltFakta => (
      enkeltFakta.fakta.includes(KV.Koder.BoolskAvklartfaktaType.SANN) ||
        (
          enkeltFakta.fakta.includes(KV.Koder.BoolskAvklartfaktaType.USANN) &&
          enkeltFakta.begrunnelseKoder.length > 0
        )
    )))
}

export default VesentligVirksomhet;
