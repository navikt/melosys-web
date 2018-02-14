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
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.SYSSELSETTING,
      },
    ],
    SYSSELSETTING: [
      {
        kriterier: 'sysselsettingType ER LIK "ARBEIDSTAKER" eller sysselsettingType ER LIK "ARBEIDSTAKER__OG__SELVSTENDIG"',
        oppfylt: ({ sysselsettingType }) => (sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER || sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG),
        nesteSteg: STEG.SEKTOR,
      },
      {
        kriterier: 'sysselsettingType ER LIK "SELVSTENDIG"',
        oppfylt: ({ sysselsettingType }) => sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG,
        nesteSteg: STEG.AKTIVITET,
      },
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ],
    SEKTOR: [
      {
        kriterier: 'ansattISektor ER LIK "OFFENTLIG',
        oppfylt: ({ ansattISektor }) => ansattISektor === VurderingSektorTyper.OFFENTLIG,
        nesteSteg: STEG.TJENESTEMANN,
      },
      {
        kriterier: 'ansattISektor ER LIK "SOKKEL" eller ansattISektor ER LIK "SKIP"',
        oppfylt: ({ ansattISektor }) => ansattISektor === VurderingSektorTyper.SOKKEL || ansattISektor === VurderingSektorTyper.SKIP,
        nesteSteg: STEG.VEDTAK,
      },
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ],
    AKTIVITET: [
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ],
    ARBEIDSFORHOLD: [
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.FORRETNINGSSTED,
      },
    ],
    FORRETNINGSSTED: [
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.SEKTOR,
      },
    ],
    TJENESTEMANN: [
      {
        kriterier: 'vurderingTjenestemann ER LIK "ETT_LAND" eller vurderingTjenestemann ER LIK "ETT_LAND_YRKESAKTIVITET_ANDRE_LAND" ' +
        'eller vurderingTjenestemann ER LIK "FLERE_LAND" eller vurderingTjenestemann ER LIK "FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND"',
        oppfylt: ({ vurderingTjenestemann }) => (
          vurderingTjenestemann === VurderingTjenestemannTyper.ETT_LAND ||
          vurderingTjenestemann === VurderingTjenestemannTyper.ETT_LAND_YRKESAKTIVITET_ANDRE_LAND ||
          vurderingTjenestemann === VurderingTjenestemannTyper.FLERE_LAND ||
          vurderingTjenestemann === VurderingTjenestemannTyper.FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND
        ),
        nesteSteg: STEG.VEDTAK,
      },
      {
        valg: 'alle andre valg',
        nesteSteg: STEG.VEDTAK,
      },
    ],
    VIRKSOMHET: [
      {
        kriterier: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG antallLand ER LIK "TO_ELLER_FLERE_LAND" OG aktivitetINorge ER LIK "UNDER_25_PROSENT"',
        oppfylt: ({ antallLand, aktivitetINorge }, { sysselsetting: { sysselsettingType } }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          antallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        kriterier: 'sysselsettingType ER LIK "SELVSTENDIG" OG ENTEN antallLand ER LIK "TO_ELLER_FLERE_LAND" ELLER antallLand ER LIK "ETT_LAND_IKKE_NORGE',
        oppfylt: ({ antallLand }, { sysselsetting: { sysselsettingType } }) => (
          sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG &&
          (
            antallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND ||
            antallLand === VurderingVirksomhetTyper.ETT_LAND_IKKE_NORGE
          )
        ),
        nesteSteg: STEG.UTSENDING,
      },
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
    BOSTEDSLAND: [
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
    UTSENDING: [
      {
        kriterier: 'alle andre valg',
        oppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
  }

  static beregnNesteSteg = (gjeldendeSteg, vurderingerIDetteSteget, alleVurderinger) => {
    console.log(gjeldendeSteg, vurderingerIDetteSteget);
    const regelsettForGjeldendeSteg = StegLogikk.stier[gjeldendeSteg];
    const nesteStiObjekt = regelsettForGjeldendeSteg.find((regel, index) => (index === regelsettForGjeldendeSteg.length - 1 ? true : regel.oppfylt(vurderingerIDetteSteget, alleVurderinger)));
    return nesteStiObjekt.nesteSteg;
  }

  static beregnAlleSteg = faktaavklaring => {
    const stegBygger = [];

    // Stegene begynner alltid med 'PERIODE'
    let gjeldendeSteg = 'PERIODE';
    stegBygger.push(gjeldendeSteg);

    while (gjeldendeSteg !== 'VEDTAK') {
      gjeldendeSteg = StegLogikk.beregnNesteSteg(gjeldendeSteg, faktaavklaring[gjeldendeSteg.toLowerCase()], faktaavklaring);
      stegBygger.push(gjeldendeSteg);

      // Bryt ut av loopen dersom flere enn 30 steg er funnet - da har det oppstått
      // en sirkulær feil.
      if (stegBygger.length > 30) { gjeldendeSteg = 'VEDTAK'; }
    }
    return stegBygger;
  }
}

export default StegLogikk;
