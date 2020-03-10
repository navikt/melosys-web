import { Inngang } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

class SaksbehandlingInngang extends Inngang {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const harMinstEttGyldigSoknadsland = Inngang.harMinstEttGyldigSoknadsland(propsLight.avklartefakta);

    this.kriterier = [
      {
        exec: () =>
          harMinstEttGyldigSoknadsland &&
          propsLight.erSoknadArbeidFlereLand,
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        exec: () => harMinstEttGyldigSoknadsland,
        nesteSteg: STEG.YRKESGRUPPE,
      },
    ];
  }
}

export default SaksbehandlingInngang;
