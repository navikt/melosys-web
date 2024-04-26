import MKV from "../../../../melosyskodeverk";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { erVilkarOppfylt, hentVilkar } from "../../../../domeneUtils";
import * as Utils from "../../../../utils";
import VurderingArtikkel12_x from "../../stegKomponenter/vurderingArtikkel12_x/vurderingArtikkel12_x";

class Artikkel12_2 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art12_2 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART12_2, propsLight.vilkar);
    const art16_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);

    const art12_eller_16_er_ikke_nil = !Utils._isNil(art12_2.oppfylt) || !Utils._isNil(art16_1.oppfylt);
    const manglerBegrunnelse12 = art12_2.oppfylt === false && art12_2.begrunnelseKoder.length === 0;
    const manglerBegrunnelse16 =
      art16_1.oppfylt === false && art16_1.begrunnelseKoder.length === 0 && art16_1.begrunnelseFritekst === null;
    const harAvklaring = art12_eller_16_er_ikke_nil && !manglerBegrunnelse12 && !manglerBegrunnelse16;

    this.kriterier = [
      {
        exec: (avklartefakta, alleVilkar) =>
          erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_2, alleVilkar) ||
          (erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) && harAvklaring),
        nesteSteg: STEG.MEDFOLGENDE_BARN,
      },
      {
        exec: (avklartefakta, alleVilkar) =>
          erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART12_2, alleVilkar) !== undefined &&
          erVilkarOppfylt(MKV.Koder.vilkaar.FO_883_2004_ART16_1, alleVilkar) !== undefined &&
          harAvklaring,
        nesteSteg: STEG.AVSLAG_12_X_OG_16,
      },
    ];
    this.id = STEG.ARTIKKEL_12_2;
    this.tittel = propsLight.konvensjonStorbritanniaToggleEnabled ? "Vurdering næringsdrivende" : "Vurdering av 12.2";
    this.komponent = VurderingArtikkel12_x;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      harAvklaring,
      art12_x: art12_2,
      artikkelNavn: "12.2",
      art16_1,
    });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel12_2;
