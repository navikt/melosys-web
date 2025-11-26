import MKV from "../../../../melosyskodeverk";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingVesentligVirksomhet from "../../stegKomponenter/vurderingVesentligVirksomhet/vurderingVesentligVirksomhet";
import { hentVilkar } from "../../../../domeneUtils";

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const vesentligVirksomhetVilkaar = hentVilkar(MKV.Koder.vilkaar.VESENTLIG_VIRKSOMHET, propsLight.vilkar);
    const harAvklaring =
      vesentligVirksomhetVilkaar.oppfylt === true ||
      (vesentligVirksomhetVilkaar.oppfylt === false && vesentligVirksomhetVilkaar.begrunnelseKoder.length > 0);

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.ARTIKKEL_12_1,
      },
    ];

    this.id = STEG.VESENTLIG_VIRKSOMHET;
    this.tittel = "Vesentlig virksomhet";
    this.komponent = VurderingVesentligVirksomhet;
    this.samleRelevanteData = (_propsLight) => ({
      valgteVirksomheter: _propsLight.valgteVirksomheter,
      begrunnelser: _propsLight.begrunnelser.vesentlig_virksomhet_begrunnelser,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      visBegrunnelser: !vesentligVirksomhetVilkaar.oppfylt,
      harAvklaring,
      vesentligVirksomhetVilkaar,
    });
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

export default VesentligVirksomhet;
