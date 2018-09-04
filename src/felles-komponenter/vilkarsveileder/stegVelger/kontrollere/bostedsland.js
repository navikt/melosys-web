import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingBostedsland, { VurderingBostedslandTyper } from '../../vurderinger/vurderingBostedsland';
import { VurderingYrkesaktivitetFordelingTyper } from '../../vurderinger/vurderingYrkesaktivitetFordeling';
import { VurderingVirksomhetTyper } from '../../vurderinger/vurderingVirksomhet';
import { VurderingSysselsettingTyper } from '../../vurderinger/vurderingSysselsetting';
import { VurderingIkkeYrkesaktivTyper } from '../../vurderinger/vurderingIkkeYrkesaktiv';
import Regler from '../../../../regler';

class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'sysselsettingType ER LIK "ARBEIDSTAKER" OG' +
        'aktivitetINorge ER LIK "UNDER_25_PROSENT" OG bostedsLand INNEHOLDER "NO" OG' +
        'antallLand ER LIK "TO_ELLER_FLERE_LAND"',
        exec: ({
          antallLand, sysselsettingType, aktivitetINorge, bostedsland = [],
        }) => (
          sysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER &&
          aktivitetINorge === VurderingVirksomhetTyper.UNDER_25_PROSENT &&
          bostedsland.includes('NO') &&
          antallLand === VurderingYrkesaktivitetFordelingTyper.TO_ELLER_FLERE_LAND
        ),
        nesteSteg: STEG.FORRETNINGSSTED,
      },
      {
        beskrivelse: 'alle andre valg',
        exec: () => true,
        nesteSteg: STEG.VEDTAK,
      },
    ];
    this._id = STEG.BOSTEDSLAND;
    this._tittel = 'Bosted';
    this._komponent = VurderingBostedsland;
    this._samleRelevanteData = () => ({});
    this._beregnRelevantUI = _propsLight => {
      const { skjema = {}, saksopplysninger = {} } = _propsLight;
      const { sakOgBehandling } = saksopplysninger;
      const { eosBarnetrygd = {} } = sakOgBehandling;

      const {
        faktaavklaringSysselsettingType,
        faktaavklaringBostedslandSnarvei,
        faktaavklaringIkkeYrkesaktivType,
      } = skjema;

      const regler = new Regler(skjema, saksopplysninger);

      const erYrkesaktiv = (
        faktaavklaringSysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG ||
        faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER ||
        faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG
      );

      let avklaringer;

      if (erYrkesaktiv) {
        avklaringer = [
          {
            term: regler.opphold().harForutgaendeBostedINorge().tekst,
            status: regler.opphold().harForutgaendeBostedINorge().status,
          },
          {
            term: regler.opphold().harAdresseIUtlandet().tekst,
            status: regler.opphold().harAdresseIUtlandet().status,
          },
          {
            term: regler.opphold().harSammeAdresseSomArbeidsgiver().tekst,
            status: regler.opphold().harSammeAdresseSomArbeidsgiver().status,
          },
          {
            term: regler.opphold().familieBorINorge().tekst,
            status: regler.opphold().familieBorINorge().status,
          },
        ];
      } else {
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.STUDENT) {
          avklaringer = [
            {
              term: regler.opphold().inntilTolvMaaneder().tekst,
              status: regler.opphold().inntilTolvMaaneder().status,
            },
            {
              term: regler.opphold().harForutgaendeBostedINorge().tekst,
              status: regler.opphold().harForutgaendeBostedINorge().status,
            },
            {
              term: regler.studier().studererIUtlandet().tekst,
              status: regler.studier().studererIUtlandet().status,
            },
            {
              term: regler.studier().studierFinansieresFraNorge().tekst,
              status: regler.studier().studierFinansieresFraNorge().status,
            },
            {
              term: regler.opphold().familieBorINorge().tekst,
              status: regler.opphold().familieBorINorge().status,
            },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.PENSJONIST) {
          avklaringer = [
            {
              term: regler.opphold().harForutgaendeBostedINorge().tekst,
              status: regler.opphold().harForutgaendeBostedINorge().status,
            },
            {
              term: regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr().tekst,
              status: regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr().status,
            },
            {
              term: regler.opphold().harEktefelleEllerBarnINorge().tekst,
              status: regler.opphold().harEktefelleEllerBarnINorge().status,
            },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
          avklaringer = [
            {
              term: regler.opphold().inntilTolvMaaneder().tekst,
              status: regler.opphold().inntilTolvMaaneder().status,
            },
            {
              term: regler.opphold().harForutgaendeBostedINorge().tekst,
              status: regler.opphold().harForutgaendeBostedINorge().status,
            },
            {
              term: regler.opphold().harIntensjonOmReturTilNorge().tekst,
              status: regler.opphold().harIntensjonOmReturTilNorge().status,
            },
          ];
        }
      }

      return {
        visBostedslandVelger: (faktaavklaringBostedslandSnarvei === VurderingBostedslandTyper.ANNET),
        visTipsForYrkesaktiv: erYrkesaktiv,
        visTipsForIkkeYrkesaktiv: !erYrkesaktiv,
        harEOSBarnetrygdSak: eosBarnetrygd,
        avklaringer,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default Bostedsland;
