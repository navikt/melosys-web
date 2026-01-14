import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingForutgaendeMedlemskap from "../../stegKomponenter/vurderingForutgaendeMedlemskap/vurderingForutgaendeMedlemskap";
import { hentVilkar } from "../../../../domeneUtils";

class ForutgaendeMedlemskap extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const forutgaendeMedlemskap = hentVilkar(MKV.Koder.vilkaar.FORUTGAAENDE_MEDLEMSKAP, propsLight.vilkar);
    const harAvklaring =
      forutgaendeMedlemskap.oppfylt === true ||
      (forutgaendeMedlemskap.oppfylt === false && forutgaendeMedlemskap.begrunnelseKoder.length > 0);

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VESENTLIG_VIRKSOMHET,
      },
    ];
    this.id = STEG.FORUTGAENDE_MEDLEMSKAP;
    this.tittel = "Forutg. medl.";
    this.komponent = VurderingForutgaendeMedlemskap;
    this.samleRelevanteData = (_propsLight) => ({
      begrunnelser: _propsLight.begrunnelser.forutgaaende_medl_begrunnelser,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      visBegrunnelser: !forutgaendeMedlemskap.oppfylt,
      forutgaendeMedlemskap,
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, innhold) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, innhold),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }
}

export default ForutgaendeMedlemskap;
