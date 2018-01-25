import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';

class TilstandsLogikk {
  static beregnTilstand = (gjeldendeSteg, faktaavklaring) => {
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
        const { virksomhet } = faktaavklaring;

        return {
          visAntallLand: true,
          visVekslingMellomLand: virksomhet.antallLand === VurderingVirksomhet.FLERE_LAND,
          visMarginaltArbeid: true,
          visAktivitetINorge: true,
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
