import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingNormaltDriverVirksomhet from "../../stegKomponenter/vurderingNormaltDriverVirksomhet/vurderingNormaltDriverVirksomhet";
import { erVilkarOppfylt, hentVilkar } from "../../../../domeneUtils";

class NormaltDriverVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: (avklartefakta, alleVilkar) =>
          erVilkarOppfylt(MKV.Koder.vilkaar.NORMALT_DRIVER_VIRKSOMHET, alleVilkar) !== undefined,
        nesteSteg: STEG.ARTIKKEL_12_2,
      },
    ];

    this.id = STEG.NORMALT_DRIVER_VIRKSOMHET;
    this.tittel = "Drift i Norge";
    this.komponent = VurderingNormaltDriverVirksomhet;
    this.samleRelevanteData = (_propsLight) => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      begrunnelser: _propsLight.begrunnelser.normalt_virksomhet_begrunnelser,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => {
      const normaltDriverVirksomhet = hentVilkar(MKV.Koder.vilkaar.NORMALT_DRIVER_VIRKSOMHET, _propsLight.vilkar);
      const harAvklaring =
        normaltDriverVirksomhet.oppfylt === true ||
        (normaltDriverVirksomhet.oppfylt === false && normaltDriverVirksomhet.begrunnelseKoder.length > 0);
      return {
        visBegrunnelser: !normaltDriverVirksomhet.oppfylt,
        harAvklaring,
        normaltDriverVirksomhet,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find((fakta) => fakta.referanse === STEG.YRKESAKTIVITET);
    if (!enkeltFakta) {
      return false;
    }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default NormaltDriverVirksomhet;
