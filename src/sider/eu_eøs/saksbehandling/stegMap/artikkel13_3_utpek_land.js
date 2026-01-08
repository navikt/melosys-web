import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArtikkel13UtpekLand from "../../stegKomponenter/vurderingArtikkel13UtpekLand/vurderingArtikkel13UtpekLand";

class Artikkel13_3_utpek_land extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [];

    this.id = STEG.ARTIKKEL_13_3_UTPEK_LAND;
    this.tittel = "Utpek land";
    this.komponent = VurderingArtikkel13UtpekLand;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      overskrift: "Utpek land etter artikkel 13 nr. 3",
    });
    this.handlers = {
      lagreOgUtpek: this._propsLight.tilgjengeligeHandlers.lagreOgUtpek,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
      byggUtpekingsperioder: this._propsLight.tilgjengeligeHandlers.byggUtpekingsperioder,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Artikkel13_3_utpek_land;
