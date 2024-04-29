import MKV from "../../../../melosyskodeverk";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { hentVilkar } from "../../../../domeneUtils";
import * as Utils from "../../../../utils";
import VurderingArtikkel12_x from "../../stegKomponenter/vurderingArtikkel12_x/vurderingArtikkel12_x";

class Artikkel12_2 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art12_2 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART12_2, propsLight.vilkar);
    const art16_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);

    const utsendingsvilkår = propsLight.konvensjonStorbritanniaToggleEnabled ? propsLight.utsendingsvilkår : art12_2;
    const unntaksvilkår = propsLight.konvensjonStorbritanniaToggleEnabled ? propsLight.unntaksvilkår : art16_1;

    const minstEttAvVilkåreneErUtfylt =
      !Utils._isNil(utsendingsvilkår?.oppfylt) || !Utils._isNil(unntaksvilkår?.oppfylt);
    const utsendingManglerBegrunnelse =
      utsendingsvilkår?.oppfylt === false && Utils._isEmpty(utsendingsvilkår.begrunnelseKoder);
    const unntakManglerBegrunnelse =
      unntaksvilkår?.oppfylt === false &&
      Utils._isEmpty(unntaksvilkår.begrunnelseKoder) &&
      !unntaksvilkår.begrunnelseFritekst;

    const harAvklaring = minstEttAvVilkåreneErUtfylt && !utsendingManglerBegrunnelse && !unntakManglerBegrunnelse;

    this.kriterier = [
      {
        exec: () => utsendingsvilkår?.oppfylt || (unntaksvilkår?.oppfylt && harAvklaring),
        nesteSteg: STEG.MEDFOLGENDE_BARN,
      },
      {
        exec: () => utsendingsvilkår?.oppfylt !== undefined && unntaksvilkår?.oppfylt !== undefined && harAvklaring,
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
      artikkelNavn: "12.2",
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
