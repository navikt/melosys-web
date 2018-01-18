// import { SYSSELSETTING } from './typer';
import VurderingSysselsetting from '../vurderinger/vurderingSysselsetting';
import VurderingSektor from '../vurderinger/vurderingSektor';
import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';


class Motor {
  static stier = {
    SYSSELSETTING: [
      {
        valg: [VurderingSysselsetting.ARBEIDSTAKER, VurderingSysselsetting.ARBEIDSTAKER_OG_SELVSTENDIG],
        til: 'SEKTOR',
      },
      {
        valg: [VurderingSysselsetting.SELVSTENDIG],
        til: 'VIRKSOMHET',
      },
    ],
    SEKTOR: [
      {
        valg: VurderingSektor.FLYVENDE,
        til: 'SELVSTENDIG',
      },
    ],
    VIRKSOMHET: [
      {
        valg: VurderingVirksomhet.ULIKE_LAND,
        til: 'SELVSTENDIG',
      },
    ],
  }

  static beregnAlleSteg = valg => {
    const stegBygger = [];

    // Stegene begynner alltid med 'SYSSELSETTING'
    let gjeldendeSteg = 'SYSSELSETTING';
    stegBygger.push(gjeldendeSteg)

    Object.values(valg).forEach(value => {
      console.log(value)
      //stegBygger.push(Motor.beregnAlleSteg(gjeldendeSteg, )
    });

    return stegBygger;
  }

  static beregnNesteSteg = (gjeldendeSteg, saksbehandlersVurderingsValg) => {
    const muligeStiValg = Motor.stier[gjeldendeSteg];
    const funnetSti = muligeStiValg.find(sti => sti.valg.includes(saksbehandlersVurderingsValg));
    return funnetSti.til;
  }
}

export default Motor;
