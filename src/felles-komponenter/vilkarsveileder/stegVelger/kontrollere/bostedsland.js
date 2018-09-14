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
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.bosted || [],
    });
    this._beregnRelevantUI = _propsLight => {
      const { skjema = {} } = _propsLight;
      const {
        faktaavklaringSysselsettingType,
        faktaavklaringBostedTerritorie,
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
          { term: 'Har søker bostedsadresse i Norge?', status: regler.opphold().harForutgaendeBostedINorge() },
          { term: 'Adresse i utlandet.', status: regler.opphold().harAdresseIUtlandet() },
          { term: 'Norsk adresse samme som norsk arbeidsgiver.', status: regler.opphold().harSammeAdresseSomArbeidsgiver() },
          { term: 'EU/EØS barnetrygd fra NAV.', status: regler.stonad().mottarEOSBarnetrygdFraNav() },
          { term: 'Familie bor i Norge.', status: regler.opphold().familieBorINorge() },
        ];
      } else {
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.STUDENT) {
          avklaringer = [
            { term: 'Oppholdet er inntil 12 mnd.', status: regler.opphold().inntilTolvManeder() },
            { term: 'Forutgående bosted i Norge.', status: regler.opphold().harForutgaendeBostedINorge() },
            { term: 'Har studiested i utlandet.', status: regler.studier().studererIUtlandet() },
            { term: 'Finansiering av studier fra Norge.', status: regler.studier().studierFinansieresFraNorge() },
            { term: 'Familie bor i Norge.', status: regler.opphold().familieBorINorge() },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.PENSJONIST) {
          avklaringer = [
            { term: 'Forutgående bosted i Norge.', status: regler.opphold().harForutgaendeBostedINorge() },
            { term: 'Er i Norge 6 mnd eller mer pr kalenderår.', status: regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr() },
            { term: 'Ektefelle og / eller mindreårige barn i Norge?', status: regler.opphold().harEktefelleEllerBarnINorge() },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
          avklaringer = [
            { term: 'Oppholdet i utlandet er inntil 12 mnd.', status: regler.opphold().inntilTolvManeder() },
            { term: 'Forutgående bosted i Norge.', status: regler.opphold().harForutgaendeBostedINorge() },
            { term: 'Er medfølgende familie til utsendt arbeidstaker', status: undefined },
            { term: 'Er intensjonen å returnere til Norge?', status: regler.opphold().harIntensjonOmReturTilNorge() },
          ];
        }
      }

      return {
        visLandListe: (faktaavklaringBostedTerritorie === VurderingBostedslandTyper.ANNET),
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
