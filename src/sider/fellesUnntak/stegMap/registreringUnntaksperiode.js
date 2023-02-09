import { FANE_STATUS, STEG } from "../../../felleskomponenter/stegvelger";
import { RegistrerUnntaksperiode } from "../stegKomponenter";
import Steg from "../../../felleskomponenter/stegvelger/stegMotor/steg";

class RegistreringUnntaksperiode extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = propsLight.vurder_start_valid; // TODO: feil
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: null, // TODO: Er det riktig å ha null her?
      },
    ];
    this.id = STEG.INNGANG;
    this.tittel = "Inngang";
    this.komponent = RegistrerUnntaksperiode;
    this.samleRelevanteData = (_propsLight) => ({
      // TODO: Sjekk om dette stemmer
      redigerbart: _propsLight.generiskStegRedigerbart,
      annenBehandlingOppfriskes: _propsLight.annenBehandlingOppfriskes,
    });
    this.beregnRelevantUI = () => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
      tilForsiden: propsLight.tilgjengeligeHandlers.tilForsiden,
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger:
        propsLight.tilgjengeligeHandlers.lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default RegistreringUnntaksperiode;
