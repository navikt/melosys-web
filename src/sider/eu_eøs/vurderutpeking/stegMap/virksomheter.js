import { Virksomheter } from "../../stegMap";
import { STEG } from "../../../../felleskomponenter/stegvelger";

class VurderUtpekingVirksomheter extends Virksomheter {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: (avklartefakta) => {
          const harValgtArbeidsgiver = Virksomheter.harValgtArbeidsgiver(avklartefakta);
          return harValgtArbeidsgiver;
        },
        nesteSteg: STEG.VURDER_UTPEKING,
      },
    ];
  }
}

export default VurderUtpekingVirksomheter;
