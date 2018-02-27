import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';
import { VurderingSektorTyper } from '../vurderinger/vurderingSektor';
import { VurderingVirksomhetTyper } from '../vurderinger/vurderingVirksomhet';
import { VurderingTjenestemannTyper } from '../vurderinger/vurderingTjenestemann';
import { VurderingYrkesaktivitetFordelingTyper } from '../vurderinger/vurderingYrkesaktivitetFordeling';

import { STEG } from './typer';

class StegLogikk {
  static stier = {
    PERIODE: [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.SYSSELSETTING,
      },
    ],
    SYSSELSETTING: [
      {
        kriterier: 'sysselsettingType ER LIK "ARBEIDSTAKER" eller sysselsettingType ER LIK "ARBEIDSTAKER__OG__SELVSTENDIG"',
        erOppfylt: ({ sysselsettingType }) => (sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER || sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG),
        nesteSteg: STEG.ARBEIDSFORHOLD,
      },
      {
        kriterier: 'sysselsettingType ER LIK "SELVSTENDIG"',
        erOppfylt: ({ sysselsettingType }) => sysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG,
        nesteSteg: STEG.YRKESAKTIVITET_FORDELING,
      },
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.BOSTEDSLAND,
      },
    ],
    ARBEIDSFORHOLD: [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.SEKTOR,
      },
    ],
    SEKTOR: [
      {
        kriterier: 'ansattISektor ER LIK "OFFENTLIG"',
        erOppfylt: ({ ansattISektor }) => ansattISektor === VurderingSektorTyper.OFFENTLIG,
        nesteSteg: STEG.TJENESTEMANN,
      },
      {
        kriterier: 'ansattISektor ER LIK "SOKKEL" eller ansattISektor ER LIK "SKIP"',
        erOppfylt: ({ ansattISektor }) => ansattISektor === VurderingSektorTyper.SOKKEL || ansattISektor === VurderingSektorTyper.SKIP,
        nesteSteg: STEG.VEDTAK,
      },
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.YRKESAKTIVITET_FORDELING,
      },
    ],
    YRKESAKTIVITET_FORDELING: [
      {
        kriterier: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG ansattISektor ER LIK "INGEN_AV_DISSE"  OG yrkesaktivitetFordeling ER LIK "ETT_LAND_IKKE_NORGE"',
        erOppfylt: ({ sysselsettingType, ansattISektor, antallLand }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          ansattISektor === VurderingSektorTyper.INGEN_AV_DISSE &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.ETT_LAND_IKKE_NORGE
        ),
        nesteSteg: STEG.UTSENDING,
      },
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ],
    AKTIVITET: [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.VIRKSOMHET,
      },
    ],
    TJENESTEMANN: [
      {
        kriterier: 'vurderingTjenestemann ER LIK "ETT_LAND" eller vurderingTjenestemann ER LIK "ETT_LAND_YRKESAKTIVITET_ANDRE_LAND" ' +
        'eller vurderingTjenestemann ER LIK "FLERE_LAND" eller vurderingTjenestemann ER LIK "FLERE_LAND_YRKESAKTIVITET_ANDRE_LAND"',
        erOppfylt: ({ vurderingTjenestemann }) => (
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
        erOppfylt: ({ sysselsettingType, antallLand, aktivitetINorge }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          antallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT
        ),
        nesteSteg: STEG.BOSTEDSLAND,
      },
      {
        kriterier: 'sysselsettingType ER LIK "SELVSTENDIG" OG ENTEN antallLand ER LIK "TO_ELLER_FLERE_LAND" ELLER antallLand ER LIK "ETT_LAND_IKKE_NORGE',
        erOppfylt: ({ sysselsettingType, antallLand }) => (
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
        erOppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
    BOSTEDSLAND: [
      {
        kriterier: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG' +
        'aktivitetINorge ER LIK "UNDER_25_PROSENT" OG bostedsLand INNEHOLDER "NO" OG' +
        'antallLand ER LIK "TO_ELLER_FLERE_LAND"',
        erOppfylt: ({
          antallLand, sysselsettingType, aktivitetINorge, bostedsland,
        }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT &&
          bostedsland.includes('NO') &&
          antallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND
        ),
        nesteSteg: STEG.FORRETNINGSSTED,
      },
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
    FORRETNINGSSTED: [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
    UTSENDING: [
      {
        kriterier: 'alle andre valg',
        erOppfylt: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ],
  }

  static beregnNesteSteg = (gjeldendeSteg, flatFaktaAvklaring) => {
    const regelsettForGjeldendeSteg = StegLogikk.stier[gjeldendeSteg];
    const nesteStiObjekt = regelsettForGjeldendeSteg.find((regel, index) => (index === regelsettForGjeldendeSteg.length - 1 ? true : regel.erOppfylt(flatFaktaAvklaring)));
    return nesteStiObjekt.nesteSteg;
  }

  static beregnAlleSteg = faktaAvklaring => {
    const stegBygger = [];
    const flatFaktaAvklaring = Object.keys(faktaAvklaring).reduce((collection, key) => ({ ...collection, ...faktaAvklaring[key] }), {});

    // Stegene begynner alltid med 'PERIODE'
    let gjeldendeSteg = 'PERIODE';
    stegBygger.push(gjeldendeSteg);

    while (gjeldendeSteg !== 'VEDTAK') {
      gjeldendeSteg = StegLogikk.beregnNesteSteg(gjeldendeSteg, flatFaktaAvklaring);
      stegBygger.push(gjeldendeSteg);

      // Bryt ut av loopen dersom flere enn 30 steg er funnet - da har det oppstått
      // en sirkulær feil.
      if (stegBygger.length > 30) { gjeldendeSteg = 'VEDTAK'; }
    }
    return stegBygger;
  }
}

export default StegLogikk;
