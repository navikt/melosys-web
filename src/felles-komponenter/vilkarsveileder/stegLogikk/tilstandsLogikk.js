import VurderingVirksomhet from '../vurderinger/vurderingVirksomhet';
import { STEG } from './typer';

class TilstandsLogikk {
  static beregnTilstand = (gjeldendeSteg, skjema) => {
    switch (gjeldendeSteg) {
      case STEG.PERIODE: {
        return {};
      }
      case STEG.SYSSELSETTING: {
        return {
          visSysselsettingType: true,
        };
      }
      case STEG.SEKTOR: {
        return {
          visAnsattISektor: true,
        };
      }
      case STEG.VIRKSOMHET: {
        const { faktaavklaringAntallLand } = skjema;

        return {
          visAntallLand: true,
          visVekslingMellomLand: faktaavklaringAntallLand === VurderingVirksomhet.TO_ELLER_FLERE_LAND,
          visMarginaltArbeid: faktaavklaringAntallLand === VurderingVirksomhet.TO_ELLER_FLERE_LAND,
          visAktivitetINorge: faktaavklaringAntallLand === VurderingVirksomhet.TO_ELLER_FLERE_LAND,
        };
      }
      case STEG.UTSENDING: {
        return {
          visUtsendingMindreEnn24Mnd: true,
          visAnsattINorskSelskap: true,
          visErstatterTidligereUtsendt: false,
        };
      }
      case STEG.AKTIVITET: {
        return {};
      }
      case STEG.ARBEIDSFORHOLD: {
        return {};
      }
      default:
        return STEG.VEDTAK;
    }
  }
}

export default TilstandsLogikk;
