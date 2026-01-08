import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel11_4 from "../../stegKomponenter/vurderingArtikkel11_4/vurderingArtikkel11_4";
import { erVilkarOppfylt, hentVilkar } from "../../../../domeneUtils";

class Artikkel11_4 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const nis = hentVilkar(MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP, propsLight.vilkar);
    const { art11_3Aeller13_3A, art11_4_1eller13_4_1, art11_4_2eller13_4_2 } = propsLight;

    const harAvklaring =
      (art11_4_1eller13_4_1.oppfylt && art11_3Aeller13_3A.oppfylt && (nis.oppfylt || nis.oppfylt === false)) ||
      art11_4_2eller13_4_2.oppfylt ||
      (art11_4_1eller13_4_1.oppfylt && !art11_3Aeller13_3A.oppfylt);

    this.kriterier = [
      {
        exec: (avklartefakta, alleVilkar) =>
          harAvklaring &&
          erVilkarOppfylt(art11_4_1eller13_4_1.vilkaar, alleVilkar) &&
          erVilkarOppfylt(art11_3Aeller13_3A.vilkaar, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: (avklartefakta, alleVilkar) => harAvklaring && erVilkarOppfylt(art11_4_2eller13_4_2.vilkaar, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: (avklartefakta, alleVilkar) => harAvklaring && erVilkarOppfylt(art11_4_1eller13_4_1.vilkaar, alleVilkar),
        nesteSteg: STEG.YRKESAKTIVITET,
      },
    ];
    this.id = STEG.ARTIKKEL_11_4;
    this.tittel = "Vurdering skip";
    this.komponent = VurderingArtikkel11_4;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = (_propsLight) => {
      return {
        harAvklaring,
        nis,
      };
    };
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel11_4;
