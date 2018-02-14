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
        kriterier: 'sektorType ER LIK "OFFENTLIG',
        oppfylt: ({ sektorType }) => sektorType === VurderingSektorTyper.OFFENTLIG,
        nesteSteg: STEG.TJENESTEMANN,
      },
      {
        kriterier: 'sektorType ER LIK "SOKKEL" eller sektorTyp ER LIK "SKIP"',
        oppfylt: ({ sektorType }) => sektorType === VurderingSektorTyper.SOKKEL || sektorType === VurderingSektorTyper.SKIP,
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
        nesteSteg: STEG.SEKTOR,
      },
    ],
    VIRKSOMHET: [
      {
        kriterier: 'faktaavklaringAntallLand ER LIK "TO_ELLER_FLERE_LAND" OG faktaavklaringAktivitetINorge ER LIK "UNDER_25_PROSENT"',
        oppfylt: ({ faktaavklaringAntallLand, faktaavklaringAktivitetINorge }) => (
          faktaavklaringAntallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND &&
          faktaavklaringAktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT
        ),
        nesteSteg: STEG.BOSTEDSLAND,
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
        nesteSteg: STEG.UTSENDING,
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

  static beregnNesteSteg = (gjeldendeSteg, vurderingerIDetteSteget) => {
    const regelsettForGjeldendeSteg = StegLogikk.stier[gjeldendeSteg];
    const nesteStiObjekt = regelsettForGjeldendeSteg.find((regel, index) => (index === regelsettForGjeldendeSteg.length - 1 ? true : regel.oppfylt(vurderingerIDetteSteget)));
    return nesteStiObjekt.nesteSteg;
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
