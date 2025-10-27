import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingPeriodeOffentligAnsattKomponent from "../../stegKomponenter/vurderingPeriodeOffentligAnsatt/vurderingPeriodeOffentligAnsatt";

class VurderingPeriodeOffentligAnsattSteg extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: () => true, // Alltid gå videre til vedtak
        nesteSteg: STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      },
    ];

    this.id = STEG.VURDERING_PERIODE_OFFENTLIG_ANSATT;
    this.tittel = "Periode";
    this.komponent = VurderingPeriodeOffentligAnsattKomponent;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default VurderingPeriodeOffentligAnsattSteg;
