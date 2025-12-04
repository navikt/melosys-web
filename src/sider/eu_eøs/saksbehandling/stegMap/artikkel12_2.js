import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import * as Utils from "../../../../utils";
import VurderingArtikkel12_x from "../../stegKomponenter/vurderingArtikkel12_x/vurderingArtikkel12_x";

class Artikkel12_2 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const { utsendingsvilkår, unntaksvilkår } = propsLight;

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
        exec: () => utsendingsvilkår?.oppfylt,
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: () => unntaksvilkår?.oppfylt && harAvklaring,
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
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
    this.tittel = "Vurdering næringsdrivende";
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
