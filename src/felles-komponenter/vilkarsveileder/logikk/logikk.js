// import { SYSSELSETTING } from './typer';
import VurderingSysselsetting from '../vurderinger/vurderingSysselsetting';
import VurderingSektor from '../vurderinger/vurderingSektor';
import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';


class Logikk {
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

  static beregnNesteSteg = (gjeldendeSteg, saksbehandlersVurderingsValg) => {
    const muligeStiValg = Logikk.stier[gjeldendeSteg];
    const funnetSti = muligeStiValg.find(sti => sti.valg.includes(saksbehandlersVurderingsValg));
    return funnetSti.til;
  }
}

export default Logikk;
