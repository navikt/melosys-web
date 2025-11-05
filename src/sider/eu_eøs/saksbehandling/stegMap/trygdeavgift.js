import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import { VurderingTrygdeavgift } from "../../stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";
import { VurderingTrygdeavgift as VurderingTrygdeavgiftFTRL } from "../../../ftrl/saksbehandling/stegKomponenter/vurderingTrygdeavgift/vurderingTrygdeavgift";

class Trygdeavgift extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      },
    ];

    this.id = STEG.TRYGDEAVGIFT;
    this.tittel = "Trygdeavgift";
    this.komponent = VurderingTrygdeavgiftFTRL;

    this.samleRelevanteData = (_propsLight) => ({
      behandlingID: _propsLight.behandlingID,
      redigerbart: _propsLight.generiskStegRedigerbart,
    });

    this.beregnRelevantUI = (_propsLight) => ({
      harAvklaring: true,
    });

    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
      oppdaterStatus: () => {}, // No-op: Step validity is managed internally by the component
    };

    this.status = FANE_STATUS.OK;
  }
}

export default Trygdeavgift;
