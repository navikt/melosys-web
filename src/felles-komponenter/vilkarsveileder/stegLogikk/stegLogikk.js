import { VurderingSektorTyper } from '../vurderinger/vurderingSektor';
import { VurderingVirksomhetTyper } from '../vurderinger/vurderingVirksomhet';
// import { VurderingBostedslandTyper } from '../vurderinger/vurderingBostedsland';

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
        valg: [],
        til: STEG.ARBEIDSFORHOLD,
      },
    ],
    SEKTOR: [
      {
        valg: [VurderingSektorTyper.FLYVENDE, VurderingSektorTyper.OFFENTLIG],
        til: STEG.TJENESTEMANN,
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
    BOSTEDSLAND: [
      {
        valg: [],
        til: STEG.SEKTOR,
      },
    ],
    TJENESTEMANN: [
      {
        valg: [],
        til: STEG.VEDTAK,
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
      case STEG.PERIODE: {
        return 'SYSSELSETTING';
      }
      case STEG.SYSSELSETTING: {
        const nesteStiObjekt = StegLogikk.stier[gjeldendeSteg][0].til;
        return nesteStiObjekt || STEG.VEDTAK;
      }
      case STEG.ARBEIDSFORHOLD: {
        return STEG.SEKTOR;
      }
      case STEG.SEKTOR: {
        const { ansattISektor } = vurderingerIDetteSteget;
        return StegLogikk.stier[gjeldendeSteg].find(sti => sti.valg.includes(ansattISektor)).til;
      }
      case STEG.VIRKSOMHET: {
        const { antallLand } = vurderingerIDetteSteget;

        if (antallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND) {
          return STEG.BOSTEDSLAND;
        }

        return STEG.AKTIVITET;
      }
      case STEG.UTSENDING: {
        return STEG.VEDTAK;
      }
      case STEG.AKTIVITET: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.BOSTEDSLAND: {
        return STEG.UTSENDING;
      }
      case STEG.TJENESTEMANN: {
        return STEG.VEDTAK;
      }
      default:
        return {};
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
