import { VurderingVirksomhetTyper } from '../vurderinger/vurderingVirksomhet';
import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';
import { VurderingBostedslandTyper } from '../vurderinger/vurderingBostedsland';
import { STEG } from './typer';
import { VurderingIkkeYrkesaktivTyper } from '../vurderinger/vurderingIkkeYrkesaktiv';

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
      case STEG.IKKE_ARBEIDENDE: {
        return {
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
        const { faktaavklaringSysselsettingType, faktaavklaringBostedslandSnarvei, faktaavklaringIkkeYrkesaktivType } = skjema;

        const erYrkesaktiv = (
          faktaavklaringSysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG ||
          faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER ||
          faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG
        );

        let avklaringer;

        if (erYrkesaktiv) {
          avklaringer = [
            { term: 'Har dnr.', status: undefined },
            { term: 'Bostedsadresse i Norge.', status: undefined },
            { term: 'Adresse i utlandet.', status: undefined },
            { term: 'Norsk adresse samme som norsk arbeidsgiver.', status: undefined },
            { term: 'EU/EØS barnetrygd fra NAV.', status: undefined },
            { term: 'Familie bor i Norge.', status: undefined },
            { term: 'Det bor færre enn 10 personer på adressen.', status: undefined },
          ];
        } else {
          if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.STUDENT) {
            avklaringer = [
              { term: 'Forutgående bosted i Norge.', status: undefined },
              { term: 'Oppholdet er inntil 12 mnd.', status: undefined },
              { term: 'Oppholder seg i utlandet.', status: undefined },
              { term: 'Har studiested i utlandet.', status: undefined },
              { term: 'Finansiering av studier fra Norge.', status: undefined },
              { term: 'Familie bor i Norge.', status: skjema.familiesBosted.includes('NO') },
            ];
          }
          if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.MEDFOLGENDE) {
            avklaringer = [
              { term: 'Forutgående bosted i Norge.', status: undefined },
              { term: 'Oppholdet er inntil 12 mnd.', status: undefined },
              { term: 'Medfølgende familie til utsendt arbeidstaker.', status: undefined },
              { term: 'Er intensjonen å returnere til Norge?', status: undefined },
            ];
          }
          if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.PENSJONIST) {
            avklaringer = [
              { term: 'Forutgående bosted i Norge.', status: undefined },
              { term: 'Er i Norge 6 mnd eller mer pr kalenderår.', status: undefined },
              { term: 'Medfølgende familie til utsendt arbeidstaker', status: undefined },
              { term: 'Er intensjonen å returnere til Norge?', status: undefined },
            ];
          }
          if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
            avklaringer = [
              { term: 'Bosatt i Norge før utreise.', status: undefined },
              { term: 'Oppholdet i utlandet er intill 12 mnd.', status: undefined },
            ];
          }
        }

        return {
          visBostedslandVelger: (faktaavklaringBostedslandSnarvei === VurderingBostedslandTyper.ANNET),
          visTipsForYrkesaktiv: erYrkesaktiv,
          avklaringer,
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
