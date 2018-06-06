import { VurderingVirksomhetTyper } from '../vurderinger/vurderingVirksomhet';
import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';
import { VurderingBostedslandTyper } from '../vurderinger/vurderingBostedsland';
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
      case STEG.YRKESAKTIVITET_FORDELING: {
        return {
          visAntallLand: true,
        };
      }
      case STEG.VIRKSOMHET: {
        return {
          visVekslingMellomLand: true,
          visMarginaltArbeid: true,
          visAktivitetINorge: true,
        };
      }
      case STEG.UTSENDING: {
        const { faktaavklaringSysselsettingType } = skjema;

        if (faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER) {
          return {
            visUtsendingMindreEnn24Mnd: true,
            visAnsattINorskSelskap: true,
            visErstatterTidligereUtsendt: true,
            visForetakDriverINorge: true,
            visHarForutgaendeMedlemskap: true,
            visArbeidKnyttetTilVirksomhetUtlandet: true,
            visSammeTypeVirksomhet: false,
          };
        }

        if (faktaavklaringSysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG) {
          return {
            visUtsendingMindreEnn24Mnd: true,
            visAnsattINorskSelskap: false,
            visErstatterTidligereUtsendt: false,
            visForetakDriverINorge: true,
            visHarForutgaendeMedlemskap: false,
            visArbeidKnyttetTilVirksomhetUtlandet: false,
            visSammeTypeVirksomhet: true,
          };
        }

        return {};
      }
      case STEG.BOSTEDSLAND: {
        const { faktaavklaringSysselsettingType, faktaavklaringBostedslandSnarvei } = skjema;

        const tilstandsObjekt = { visBostedslandVelger: faktaavklaringBostedslandSnarvei === VurderingBostedslandTyper.ANNET };

        if (
          faktaavklaringSysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG ||
          faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER ||
          faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG
        ) {
          return {
            ...tilstandsObjekt,
            visTipsForYrkesaktiv: true,
          };
        }

        return {
          ...tilstandsObjekt,
          visTipsForIkkeYrkesaktiv: true,
        };
      }

      case STEG.FORRETNINGSSTED: {
        return {};
      }
      case STEG.AKTIVITET: {
        const { faktaavklaringAntallLand, faktaavklaringAktivitetINorge } = skjema;

        return {
          sporOmHovedtyngden: (faktaavklaringAntallLand === VurderingVirksomhetTyper.TO_ELLER_FLERE_LAND && faktaavklaringAktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT),
        };
      }
      case STEG.ARBEIDSFORHOLD: {
        return {};
      }
      default:
        return {};
    }
  }
}

export default TilstandsLogikk;
