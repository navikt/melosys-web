import { Inngang } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

class VurderUtpekingInngang extends Inngang {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: () => this.harAvklaring(propsLight.avklartefakta),
        nesteSteg: STEG.VIRKSOMHETER,
      },
    ];
  }
}

export default VurderUtpekingInngang;
