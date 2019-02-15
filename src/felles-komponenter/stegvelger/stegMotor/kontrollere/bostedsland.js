import Steg from '../steg';
import {FANE_STATUS, STEG} from '../typer';
import VurderingBostedsland from '../../stegKomponenter/vurderingBostedsland';
import * as KV from '../../../../kodeverk';

import Regler from '../../../../regler';

class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this._kriterier = [
      {
        beskrivelse: 'konklusjon for sokkel/skip-steget ER LIK "SKIP_ETT_LAND" og det er gjort en vurdering av bosted, enten utfallet er TRUE eller FALSE',
        exec: (avklartefakta, vilkar) => (
          Bostedsland.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND) && vilkar.find(enkelt => enkelt.vilkaar === 'BOSATT_I_NORGE') && true
        ),
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
      redigerbart: _propsLight.redigerbart,
    });
    this._beregnRelevantUI = _propsLight => {
      const { skjema = {}, saksopplysninger = {} } = _propsLight;
      const { bostedsland, yrkesaktivitet } = skjema.avklartefakta;
      const { sakOgBehandling } = saksopplysninger;
      const { eosBarnetrygd = {} } = sakOgBehandling;

      const {
        avklartefaktaYrkesgruppeType,
        vilkar,
      } = skjema;

      const { bosattINorge, bosattINorgeBegrunnelser } = vilkar;

      const regler = new Regler(skjema, saksopplysninger);

      const erYrkesaktiv = (
        avklartefaktaYrkesgruppeType === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER ||
        avklartefaktaYrkesgruppeType === KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP ||
        avklartefaktaYrkesgruppeType === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL
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
        if (yrkesaktivitet === KV.Koder.VurderingIkkeYrkesaktivTyper.STUDENT) {
          avklaringer = [
            { ...regler.opphold().inntilTolvMaaneder() },
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.studier().studererIUtlandet() },
            { ...regler.studier().studierFinansieresFraNorge() },
            { ...regler.opphold().familieBorINorge() },
          ];
        }
        if (yrkesaktivitet === KV.Koder.VurderingIkkeYrkesaktivTyper.PENSJONIST) {
          avklaringer = [
            { ...regler.opphold().harForutgaendeBostedINorge() },
            { ...regler.opphold().erINorgeSeksManederEllerMerPerKalenderAr() },
            { ...regler.opphold().harEktefelleEllerBarnINorge() },
          ];
        }
        if (yrkesaktivitet === KV.Koder.VurderingIkkeYrkesaktivTyper.INGEN_AV_DISSE) {
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
