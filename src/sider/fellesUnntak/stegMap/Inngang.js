import { FANE_STATUS, STEG } from "../../../felleskomponenter/stegvelger";
import Steg from "../../../felleskomponenter/stegvelger/stegMotor/steg";
import { VurderingInngang } from "../stegKomponenter";

class Inngang extends Steg {
  // TODO: Konverter til TSX
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = propsLight.vurder_start_valid; // TODO: feil
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.REGISTRER_UNNTAKSPERIODE,
      },
    ];
    this.id = STEG.INNGANG;
    this.tittel = "Inngang";
    this.komponent = VurderingInngang;
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

export default Inngang;
