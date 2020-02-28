import { Inngang } from '../../../felleskomponenter/stegvelger/stegMap';
import { STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';

class SaksbehandlingInngang extends Inngang {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [
      {
        exec: avklartefakta => (Inngang.harMinstEttGyldigSoknadsland(avklartefakta)),
        nesteSteg: STEG.YRKESGRUPPE,
      },
    ];
  }
}

export default SaksbehandlingInngang;
