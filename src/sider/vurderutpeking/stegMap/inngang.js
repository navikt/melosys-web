import { Inngang } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

class VurderUtpekingInngang extends Inngang {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const { avklartefakta, inngangsvilkaar } = propsLight;
    const harAvklaring = this.harAvklaring(avklartefakta, inngangsvilkaar);

    this.kriterier = [
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.VIRKSOMHETER,
      },
    ];
  }
}

export default VurderUtpekingInngang;
