import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';

class TilstandsLogikk {
  static beregnTilstand = (gjeldendeSteg, skjema) => {
    switch (gjeldendeSteg) {
      case 'PERIODE': {
        return {};
      }
      case 'SYSSELSETTING': {
        return {
          visSysselsettingType: true,
        };
      }
      case 'SEKTOR': {
        return {
          visAnsattISektor: true,
        };
      }
      case 'VIRKSOMHET': {
        const { faktaavklaringAntallLand } = skjema;

        return {
          visAntallLand: true,
          visVekslingMellomLand: faktaavklaringAntallLand === VurderingVirksomhet.TO_ELLER_FLERE_LAND,
          visMarginaltArbeid: faktaavklaringAntallLand === VurderingVirksomhet.TO_ELLER_FLERE_LAND,
          visAktivitetINorge: faktaavklaringAntallLand === VurderingVirksomhet.TO_ELLER_FLERE_LAND,
        };
      }
      case 'UTSENDING': {
        return {
          visUtsendingMindreEnn24Mnd: true,
          visAnsattINorskSelskap: true,
          visErstatterTidligereUtsendt: false,
        };
      }
      case 'AKTIVITET': {
        return {};
      }
      case 'ARBEIDSFORHOLD': {
        return {};
      }
      default:
        return 'FEIL';
    }
  }
}

export default TilstandsLogikk;
