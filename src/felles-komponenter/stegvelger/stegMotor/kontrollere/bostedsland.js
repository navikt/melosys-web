import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingBostedsland from '../../stegKomponenter/vurderingBostedsland';
import { VurderingSysselsettingTyper } from '../../stegKomponenter/vurderingSysselsetting';
import { VurderingIkkeYrkesaktivTyper } from '../../stegKomponenter/vurderingIkkeYrkesaktiv';
import { VurderingSokkelSkipTyper } from '../../stegKomponenter/vurderingSokkelSkip';

import Regler from '../../../../regler';

class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'sokkelSkipKonklusjon ER LIK "SKIP_ETT_LAND" (videre til 12.1 eller 12.2)',
        exec: avklartefakta => Bostedsland.finnAvklaring(avklartefakta, VurderingSokkelSkipTyper.SKIP_ETT_LAND),
        nesteSteg: STEG.ARTIKKEL_11_4,
      },
      {
        beskrivelse: 'dead end',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    this._id = STEG.BOSTEDSLAND;
    this._tittel = 'Bosted';
    this._komponent = VurderingBostedsland;
    this._samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.bosted || [],
    });
    this._beregnRelevantUI = _propsLight => {
      const { skjema = {}, saksopplysninger = {} } = _propsLight;
      const { bostedsland, sysselsetting, yrkesaktivitet } = skjema.avklartefakta;
      const { bosattINorge, bosattINorgeBegrunnelser } = skjema.vilkar;
      const { sakOgBehandling } = saksopplysninger;
      const { eosBarnetrygd = {} } = sakOgBehandling;

      const regler = new Regler(skjema, saksopplysninger);

      const erYrkesaktiv = (
        sysselsetting === VurderingSysselsettingTyper.YRKESAKTIV ||
        sysselsetting === VurderingSysselsettingTyper.YRKESAKTIV_SOKKEL_SKIP ||
        sysselsetting === VurderingSysselsettingTyper.YRKESAKTIV_FLYVENDE
      );

      console.log('erYrkesaktiv', erYrkesaktiv);

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
        if (yrkesaktivitet === VurderingIkkeYrkesaktivTyper.STUDENT) {
          avklaringer = [
            { ...regler.opphold().inntilTolvMaaneder() },
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.studier().studererIUtlandet() },
            { ...regler.studier().studierFinansieresFraNorge() },
            { ...regler.opphold().familieBorINorge() },
          ];
        }
        if (yrkesaktivitet === VurderingIkkeYrkesaktivTyper.PENSJONIST) {
          avklaringer = [
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr() },
            { ...regler.opphold().harEktefelleEllerBarnINorge() },
          ];
        }
        if (yrkesaktivitet === VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
          avklaringer = [
            { ...regler.opphold().inntilTolvMaaneder() },
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.opphold().harIntensjonOmReturTilNorge() },
          ];
        }
      }

      return {
        erAvklart: Bostedsland.alleErAvklart(bosattINorge, bosattINorgeBegrunnelser, bostedsland),
        erBosattINorge: bosattINorge,
        harEOSBarnetrygdSak: eosBarnetrygd,
        avklaringer,
      };
    };
    this._handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this._status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === 'ARBEID_SOKKEL_SKIP');

    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (bosattINorge, bosattINorgeBegrunnelser, bostedsland) => {
    if (!(bosattINorge === true || bosattINorge === false)) { return false; }
    const begrunnelserErOppgitt = bosattINorgeBegrunnelser && bosattINorgeBegrunnelser.length > 0;
    const bostedslandErOppgitt = bostedsland && bostedsland !== '';

    if (bosattINorge === false && bostedslandErOppgitt && begrunnelserErOppgitt) { return true; }

    return bosattINorge;
  };
}

export default Bostedsland;
