import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel11_4 from "../../stegKomponenter/vurderingArtikkel11_4";
import { erVilkarOppfylt, hentVilkar } from "../../../../domeneUtils";

class Artikkel11_4 extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const art11_3A = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART11_3A, propsLight.vilkar);
    const art11_4_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART11_4_1, propsLight.vilkar);
    const art11_4_2 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART11_4_2, propsLight.vilkar);
    const nis = hentVilkar(MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP, propsLight.vilkar);
    const harAvklaring =
      (art11_4_1.oppfylt && art11_3A.oppfylt && (nis.oppfylt || nis.oppfylt === false)) ||
      art11_4_2.oppfylt ||
      (art11_4_1.oppfylt && !art11_3A.oppfylt);

    this.kriterier = [
      {
        exec: (avklartefakta, alleVilkar) =>
          harAvklaring &&
          erVilkarOppfylt(
            MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
            alleVilkar
          ) &&
          erVilkarOppfylt(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A, alleVilkar),
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: (avklartefakta, alleVilkar) =>
          harAvklaring &&
          erVilkarOppfylt(
            MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
            alleVilkar
          ),
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: (avklartefakta, alleVilkar) =>
          harAvklaring &&
          erVilkarOppfylt(
            MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
            alleVilkar
          ),
        nesteSteg: STEG.YRKESAKTIVITET,
      },
    ];
    this.id = STEG.ARTIKKEL_11_4;
    this.tittel = "Vurdering av 11.4";
    this.komponent = VurderingArtikkel11_4;
    this.samleRelevanteData = (_propsLight) => ({
      artikkel: {
        kode: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
        term: "11.4",
      },
      bostedsland: _propsLight.bostedsland,
      arbeidsland: _propsLight.arbeidsland,
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      begrunnelser: _propsLight.begrunnelser.art11_4_begrunnelser || [],
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = (_propsLight) => {
      const visNISAvsnitt = art11_4_1.oppfylt && art11_3A.oppfylt;

      return {
        harAvklaring,
        art11_3A,
        art11_4_1,
        art11_4_2,
        nis,
        visNISAvsnitt,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel11_4;
