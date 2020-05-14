import { Inngang } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

class SaksbehandlingInngang extends Inngang {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const harAvklaring = this.harAvklaring(propsLight.avklartefakta);

    this.kriterier = [
      {
        exec: () =>
          harAvklaring &&
          propsLight.erSoknadArbeidFlereLand,
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        exec: () =>
          harAvklaring &&
          propsLight.erArbeidEttLandOvrig,
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: () => harAvklaring,
        nesteSteg: STEG.YRKESGRUPPE,
      },
    ];
  }
}

export default SaksbehandlingInngang;
