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
    this._dataHenter = () => ({ });
    this._tilstand = _propsLight => {
      const { skjema = {} } = _propsLight;
      const {
        faktaavklaringSysselsettingType,
        faktaavklaringBostedslandSnarvei,
        faktaavklaringIkkeYrkesaktivType,
      } = skjema;

      const regler = new Regler(skjema);

      const erYrkesaktiv = (
        faktaavklaringSysselsettingType === VurderingSysselsettingTyper.SELVSTENDIG ||
        faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER ||
        faktaavklaringSysselsettingType === VurderingSysselsettingTyper.ARBEIDSTAKER_OG_SELVSTENDIG
      );

      let avklaringer;

      if (erYrkesaktiv) {
        avklaringer = [
          { term: 'Bostedsadresse i Norge.', status: regler.opphold().forutgaendeBostedINorge() },
          { term: 'Adresse i utlandet.', status: regler.opphold().harAdresseIUtlandet() },
          { term: 'Norsk adresse samme som norsk arbeidsgiver.', status: regler.opphold().harSammeAdresseSomArbeidsgiver() },
          { term: 'EU/EØS barnetrygd fra NAV.', status: regler.stonad().mottarEOSBarnetrygdFraNav() },
          { term: 'Familie bor i Norge.', status: regler.opphold().familieBorINorge() },
        ];
      } else {
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.STUDENT) {
          avklaringer = [
            { term: 'Forutgående bosted i Norge.', status: regler.opphold().forutgaendeBostedINorge() },
            { term: 'Oppholdet er inntil 12 mnd.', status: regler.opphold().inntilTolvManeder() },
            { term: 'Oppholder seg i utlandet.', status: regler.opphold().oppholderSegIUtlandet() },
            { term: 'Har studiested i utlandet.', status: regler.studier().studererIUtlandet() },
            { term: 'Finansiering av studier fra Norge.', status: regler.studier().studierFinansieresFraNorge() },
            { term: 'Familie bor i Norge.', status: regler.opphold().familieBorINorge() },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.PENSJONIST) {
          avklaringer = [
            { term: 'Forutgående bosted i Norge.', status: regler.opphold().forutgaendeBostedINorge() },
            { term: 'Er i Norge 6 mnd eller mer pr kalenderår.', status: regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr() },
            { term: 'Ektefelle og / eller mindreårige barn i Norge?', status: regler.opphold().ektefelleEllerBarn() },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
          avklaringer = [
            { term: 'Bosatt i Norge før utreise.', status: regler.opphold().forutgaendeBostedINorge() },
            { term: 'Oppholdet i utlandet er inntil 12 mnd.', status: regler.opphold().inntilTolvManeder() },
          ];
        }
      }

      return {
        visBostedslandVelger: (faktaavklaringBostedslandSnarvei === VurderingBostedslandTyper.ANNET),
        visTipsForYrkesaktiv: erYrkesaktiv,
        visTipsForIkkeYrkesaktiv: !erYrkesaktiv,
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
