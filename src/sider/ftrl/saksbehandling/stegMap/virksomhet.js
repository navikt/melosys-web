import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger/stegMotor/typer";
import VurderingVirksomhet from "../../../../felleskomponenter/stegvelger/stegKomponenter/ftrl/vurderingVirksomhet";

class Virksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const harAvklaring = propsLight.lagredeVirksomheter.length > 0;
    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.BESTEMMELSE,
      },
    ];
    this.id = STEG.VIRKSOMHET;
    this.tittel = "Virksomhet";
    this.komponent = VurderingVirksomhet;
    this.samleRelevanteData = (_propsLight) => ({
      lagredeVirksomheter: _propsLight.lagredeVirksomheter,
      redigerbart: _propsLight.redigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({ harAvklaring });
    this.handlers = {
      bekreft: propsLight.tilgjengeligeHandlers.bekreft,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdater: propsLight.tilgjengeligeHandlers.oppdater,
    };
    this.status = FANE_STATUS.OK;
  }
}
export default Virksomhet;
