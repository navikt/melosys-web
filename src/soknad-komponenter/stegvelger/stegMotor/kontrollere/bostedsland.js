import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../../kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingBostedsland from '../../stegKomponenter/vurderingBostedsland';

import Regler from '../../../../regler';
import { hentVilkar } from '../../../../regler/vilkar';
import { hentFakta } from '../../../../regler/avklartefakta';
import YrkesaktivitetAntallLand from './yrkesaktivitet_antall_land';


class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'konklusjon for sokkel/skip-steget ER LIK "SKIP_ETT_LAND" og det er gjort en vurdering av bosted, enten utfallet er TRUE eller FALSE',
        exec: (avklartefakta, vilkar) => (
          Bostedsland.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND) && vilkar.find(enkelt => enkelt.vilkaar === 'BOSATT_I_NORGE') && true
        ),
        nesteSteg: STEG.ARTIKKEL_11_4,
      },
      {
        beskrivelse: 'to eller flere land',
        exec: (avklartefakta, vilkar) => {
          const harBostedsland = vilkar.some(enkelt => enkelt.vilkaar === 'BOSATT_I_NORGE');
          const erToEllerFlereLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND);
          return harBostedsland && erToEllerFlereLand;
        },
        nesteSteg: STEG.ARBEIDSMONSTER,
      },
      {
        beskrivelse: 'dead end',
        exec: () => true,
        nesteSteg: null,
      },
    ];
    const begrunnelserPaaKrevd = false;

    this.id = STEG.BOSTEDSLAND;
    this.tittel = 'Bosted';
    this.komponent = VurderingBostedsland;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.bosted || [],
      redigerbart: _propsLight.redigerbart,
      begrunnelserPaaKrevd,
    });
    this.beregnRelevantUI = _propsLight => {
      const { skjema = {}, saksopplysninger = {} } = _propsLight;
      const { sakOgBehandling } = saksopplysninger;
      const { eosBarnetrygd = {} } = sakOgBehandling;

      const bostedsland = hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, _propsLight.avklartefakta);
      const yrkesaktivitet = hentFakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET, _propsLight.avklartefakta);
      const yrkesgruppe = hentFakta(KV.Koder.avklartefaktaKoder.YRKESGRUPPE, _propsLight.avklartefakta);

      const bosattINorgeVilkaar = hentVilkar(MKV.Koder.vilkaar.BOSATT_I_NORGE, _propsLight.vilkar);
      const { oppfylt: bosattINorge, begrunnelseKoder } = bosattINorgeVilkaar;

      const regler = new Regler(skjema, saksopplysninger);
      const erYrkesaktiv = (
        yrkesgruppe === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER ||
        yrkesgruppe === KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP ||
        yrkesgruppe === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL
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
        harAvklaring: Bostedsland.alleErAvklart(bosattINorge, begrunnelseKoder, bostedsland, begrunnelserPaaKrevd),
        erBosattINorge: bosattINorge,
        bosattINorgeVilkaar,
        harEOSBarnetrygdSak: eosBarnetrygd,
        avklaringer,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (type, felt) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, type, felt),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === 'ARBEID_SOKKEL_SKIP');

    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (bosattINorge, bosattINorgeBegrunnelser, bostedsland, begrunnelserPaaKrevd) => {
    if (!(bosattINorge === true || bosattINorge === false)) { return false; }
    const begrunnelserErOppgitt = bosattINorgeBegrunnelser && bosattINorgeBegrunnelser.length > 0;
    const bostedslandErOppgitt = bostedsland && bostedsland !== '';

    if (bosattINorge === false && bostedslandErOppgitt && (!begrunnelserPaaKrevd || begrunnelserErOppgitt)) { return true; }

    return bosattINorge;
  };
}

export default Bostedsland;
