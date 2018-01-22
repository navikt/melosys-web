// import { SYSSELSETTING } from './typer';
import VurderingSysselsetting from '../vurderinger/vurderingSysselsetting';
import VurderingSektor from '../vurderinger/vurderingSektor';
import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';


class StegLogikk {
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
        til: 'VEDTAK',
      },
    ],
    VIRKSOMHET: [
      {
        valg: VurderingVirksomhet.ULIKE_LAND,
        til: 'VEDTAK',
      },
    ],
    ARBEIDSFORHOLD: [
      {
        valg: [],
        til: 'VEDTAK',
      },
    ],
    VEDTAK: [
      {
        valg: null,
        til: null,
      },
    ],
  }

  static beregnNesteSteg = (gjeldendeSteg, vurderingerIForrigeSteg) => {
    switch (gjeldendeSteg) {
      case 'SYSSELSETTING': {
        const { sysselsettingType } = vurderingerIForrigeSteg;
        return StegLogikk.stier[gjeldendeSteg].find(sti => sti.valg.includes(sysselsettingType)).til;
      }
      case 'SEKTOR': {
        return 'VIRKSOMHET';
      }
      case 'VIRKSOMHET': {
        return 'ARBEIDSFORHOLD';
      }
      case 'ARBEIDSFORHOLD': {
        return 'VEDTAK';
      }
      default:
        return 'FEIL';
    }
  }

  static beregnAlleSteg = faktaavklaring => {
    const stegBygger = [];

    // Stegene begynner alltid med 'SYSSELSETTING'
    let gjeldendeSteg = 'SYSSELSETTING';
    stegBygger.push(gjeldendeSteg);

    while (gjeldendeSteg !== 'VEDTAK') {
      gjeldendeSteg = StegLogikk.beregnNesteSteg(gjeldendeSteg, faktaavklaring[gjeldendeSteg.toLowerCase()]);
      stegBygger.push(gjeldendeSteg);
    }
    return stegBygger;
  }
}

export default StegLogikk;
