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

      /** Regelklassene returnerer alltid et objekt i formatet {status: true, tekst: 'foo}
       * Dermed kan vi destructe dette svaret rett inn i en array av regler som sendes videre
       * ut til selve visningskomponenten VurderingBostedsland.
       */
      if (erYrkesaktiv) {
        avklaringer = [
          { ...regler.opphold().harForutgaendeBostedINorge() },
          { ...regler.opphold().harAdresseIUtlandet() },
          { ...regler.opphold().harSammeAdresseSomArbeidsgiver() },
          { ...regler.opphold().familieBorINorge() },
        ];
      } else {
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.STUDENT) {
          avklaringer = [
            { ...regler.opphold().inntilTolvMaaneder() },
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.studier().studererIUtlandet() },
            { ...regler.studier().studierFinansieresFraNorge() },
            { ...regler.opphold().familieBorINorge() },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.PENSJONIST) {
          avklaringer = [
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr() },
            { ...regler.opphold().harEktefelleEllerBarnINorge() },
          ];
        }
        if (faktaavklaringIkkeYrkesaktivType === VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
          avklaringer = [
            { ...regler.opphold().inntilTolvMaaneder() },
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.opphold().harIntensjonOmReturTilNorge() },
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
