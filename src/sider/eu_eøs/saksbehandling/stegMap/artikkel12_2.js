import MKV from "../../../../melosyskodeverk";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { hentVilkarEllerNull } from "../../../../domeneUtils";
import * as Utils from "../../../../utils";
import VurderingArtikkel12_x from "../../stegKomponenter/vurderingArtikkel12_x/vurderingArtikkel12_x";

class Artikkel12_2 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art12_2 = hentVilkarEllerNull(MKV.Koder.vilkaar.FO_883_2004_ART12_2, propsLight.vilkar);
    const art14_2konv = hentVilkarEllerNull(MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART14_2, propsLight.vilkar);
    const art16_3konv = hentVilkarEllerNull(MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART16_3, propsLight.vilkar);
    const art16_1 = hentVilkarEllerNull(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);
    const art18_1konv = hentVilkarEllerNull(MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART18_1, propsLight.vilkar);

    const utsendingsvilkår = propsLight.konvensjonStorbritanniaToggleEnabled
      ? art12_2
      : art12_2 ?? art14_2konv ?? art16_3konv;
    const unntaksvilkår = propsLight.konvensjonStorbritanniaToggleEnabled ? art16_1 : art16_1 ?? art18_1konv;

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
        exec: () => utsendingsvilkår?.oppfylt !== undefined || (unntaksvilkår?.oppfylt !== undefined && harAvklaring),
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
