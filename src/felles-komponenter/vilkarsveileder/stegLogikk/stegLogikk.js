// import { SYSSELSETTING } from './typer';
import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';
import { VurderingSektorTyper } from '../vurderinger/vurderingSektor';
import { VurderingVirksomhetTyper } from '../vurderinger/vurderingVirksomhet';

import { STEG } from './typer';

class StegLogikk {
  static SISTE_STEG = null;

  static stier = {
    PERIODE: [
      {
        valg: [],
        til: STEG.SYSSELSETTING,
      },
    ],
    SYSSELSETTING: [
      {
        valg: [VurderingSysselsettingTyper.ARBEIDSTAKER, VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG],
        til: STEG.SEKTOR,
      },
      {
        valg: [VurderingSysselsettingTyper.SELVSTENDIG],
        til: STEG.VIRKSOMHET,
      },
    ],
    SEKTOR: [
      {
        valg: [VurderingSektorTyper.FLYVENDE, VurderingSektorTyper.OFFENTLIG],
        til: STEG.VEDTAK,
      },
      {
        valg: VurderingSektorTyper.SOKKEL,
        til: STEG.VEDTAK,
      },
      {
        valg: VurderingSektorTyper.INGEN_AV_DISSE,
        til: STEG.VIRKSOMHET,
      },
    ],
    UTSENDING: [
      {
        valg: [],
        til: STEG.VEDTAK,
      },
    ],
    VIRKSOMHET: [
      {
        valg: [],
        til: STEG.AKTIVITET,
      },
    ],
    AKTIVITET: [
      {
        valg: [],
        til: STEG.VEDTAK,
      },
    ],
    ARBEIDSFORHOLD: [
      {
        valg: [],
        til: STEG.VEDTAK,
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
        const { antallLand } = vurderingerIDetteSteget;

        if (antallLand === VurderingVirksomhetTyper.FLERE_LAND) {
          return 'UTSENDING';
        }

        return 'AKTIVITET';
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
