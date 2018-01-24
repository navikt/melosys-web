// import { SYSSELSETTING } from './typer';
import VurderingSysselsetting from '../vurderinger/vurderingSysselsetting';
import VurderingSektor from '../vurderinger/vurderingSektor';
import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';


class StegLogikk {
  static SISTE_STEG = null;

  static stier = {
    PERIODE: [
      {
        valg: [],
        til: 'SYSSELSETTING',
      },
    ],
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
        valg: [VurderingSektor.FLYVENDE, VurderingSektor.OFFENTLIG],
        til: 'VEDTAK',
      },
      {
        valg: VurderingSektor.SOKKEL,
        til: 'VEDTAK',
      },
      {
        valg: VurderingSektor.INGEN_AV_DISSE,
        til: 'VIRKSOMHET',
      },
    ],
    UTSENDING: [
      {
        valg: [],
        til: 'VEDTAK',
      },
    ],
    VIRKSOMHET: [
      {
        valg: [],
        til: 'UTSENDING',
      },
    ],
    AKTIVITET: [
      {
        valg: [],
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
        valg: StegLogikk.SISTE_STEG,
        til: StegLogikk.SISTE_STEG,
      },
    ],
  }

  static beregnNesteSteg = (gjeldendeSteg, vurderingerIDetteSteget) => {
    switch (gjeldendeSteg) {
      case 'PERIODE': {
        return 'SYSSELSETTING';
      }
      case 'SYSSELSETTING': {
        const { sysselsettingType } = vurderingerIDetteSteget;
        return StegLogikk.stier[gjeldendeSteg].find(sti => sti.valg.includes(sysselsettingType)).til;
      }
      case 'SEKTOR': {
        const { ansattISektor } = vurderingerIDetteSteget;
        return StegLogikk.stier[gjeldendeSteg].find(sti => sti.valg.includes(ansattISektor)).til;
      }
      case 'VIRKSOMHET': {
        const { fordelingArbeidsgivere } = vurderingerIDetteSteget;
        if (fordelingArbeidsgivere === VurderingVirksomhet.ULIKE_LAND) {
          return 'UTSENDING';
        }

        return 'VEDTAK';
      }
      case 'UTSENDING': {
        return 'VEDTAK';
      }
      case 'AKTIVITET': {
        return 'VEDTAK';
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

    // Stegene begynner alltid med 'PERIODE'
    let gjeldendeSteg = 'PERIODE';
    stegBygger.push(gjeldendeSteg);

    while (gjeldendeSteg !== 'VEDTAK') {
      gjeldendeSteg = StegLogikk.beregnNesteSteg(gjeldendeSteg, faktaavklaring[gjeldendeSteg.toLowerCase()]);
      stegBygger.push(gjeldendeSteg);
    }
    return stegBygger;
  }
}

export default StegLogikk;
