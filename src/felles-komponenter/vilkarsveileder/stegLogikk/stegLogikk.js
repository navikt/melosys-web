import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';
import { VurderingSektorTyper } from '../vurderinger/vurderingSektor';
import { VurderingVirksomhetTyper } from '../vurderinger/vurderingVirksomhet';
import { VurderingTjenestemannTyper } from '../vurderinger/vurderingTjenestemann';

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
        til: STEG.AKTIVITET,
      },
      {
        valg: [VurderingSysselsettingTyper.IKKE_ARBEIDENDE],
        til: STEG.BOSTEDSLAND,
      },
    ],
    SEKTOR: [
      {
        valg: [VurderingSektorTyper.FLYVENDE, VurderingSektorTyper.OFFENTLIG],
        til: STEG.TJENESTEMANN,
      },
      {
        valg: [VurderingSektorTyper.SOKKEL, VurderingSektorTyper.SKIP],
        til: STEG.VEDTAK,
      },
      {
        valg: [VurderingSektorTyper.INGEN_AV_DISSE],
        til: STEG.VIRKSOMHET,
      },
    ],
    AKTIVITET: [
      {
        valg: [],
        til: STEG.VIRKSOMHET,
      },
    ],
    ARBEIDSFORHOLD: [
      {
        valg: [],
        til: STEG.FORRETNINGSSTED,
      },
    ],
    FORRETNINGSSTED: [
      {
        valg: [],
        til: STEG.SEKTOR,
      },
    ],
    TJENESTEMANN: [
      {
        valg: [
          VurderingTjenestemannTyper.ETT_LAND,
          VurderingTjenestemannTyper.ETT_LAND_YRKESAKTIVITET_ANDRE_LAND,
          VurderingTjenestemannTyper.FLERE_LAND,
          VurderingTjenestemannTyper.FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND,
        ],
        til: STEG.VEDTAK,
      },
      {
        valg: [VurderingTjenestemannTyper.IKKE_TJENESTEMANN],
        til: STEG.VIRKSOMHET,
      },
    ],
    VIRKSOMHET: [
      {
        valg: [VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND],
        til: STEG.BOSTEDSLAND,
      },
      {
        valg: [],
        til: STEG.VEDTAK,
      },
    ],
    BOSTEDSLAND: [
      {
        valg: [],
        til: STEG.UTSENDING,
      },
    ],
    UTSENDING: [
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
        const { sysselsettingType } = vurderingerIDetteSteget;
        const nesteStiObjekt = StegLogikk.stier[gjeldendeSteg].find(sti => sti.valg.includes(sysselsettingType));
        return nesteStiObjekt ? nesteStiObjekt.til : 'VEDTAK';
      }
      case STEG.SEKTOR: {
        const { ansattISektor } = vurderingerIDetteSteget;
        return StegLogikk.stier[gjeldendeSteg].find(sti => sti.valg.includes(ansattISektor)).til;
      }
      case STEG.VIRKSOMHET: {
        console.log('virksomhetsvurderinger', vurderingerIDetteSteget);
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.ARBEIDSFORHOLD: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.UTSENDING: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.AKTIVITET: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.BOSTEDSLAND: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.FORRETNINGSSTED: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
      }
      case STEG.TJENESTEMANN: {
        return StegLogikk.stier[gjeldendeSteg][0].til;
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

      // Bryt ut av loopen dersom flere enn 30 steg er funnet - da har det oppstått
      // en sirkulær feil.
      if (stegBygger.length > 30) { gjeldendeSteg = 'VEDTAK'; }
    }
    return stegBygger;
  }
}

export default StegLogikk;
