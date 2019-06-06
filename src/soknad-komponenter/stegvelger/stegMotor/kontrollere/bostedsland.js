import * as MKV from 'melosys-kodeverk';
import * as KV from '../../../../kodeverk';
import Steg from '../steg';
import { FANE_STATUS, STEG } from '../typer';
import VurderingBostedsland from '../../stegKomponenter/vurderingBostedsland';

import { hentFakta, hentFaktaVerdi } from '../../../../regler/avklartefakta';
import YrkesaktivitetAntallLand from './yrkesaktivitet_antall_land';
import SokkelSkip from './sokkel_skip';
import * as Utils from '../../../../utils';


class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        beskrivelse: 'konklusjon for sokkel/skip-steget ER LIK "SKIP_ETT_LAND" og det er gjort en vurdering av bosted, enten utfallet er TRUE eller FALSE',
        exec: avklartefakta => (
          SokkelSkip.finnAvklaring(avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND)
        ),
        nesteSteg: STEG.ARTIKKEL_11_4,
      },
      {
        beskrivelse: 'to eller flere land',
        exec: avklartefakta => {
          const erToEllerFlereLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND);
          const harBostedslandNorge = Bostedsland.finnAvklaring(avklartefakta, MKV.Koder.landkoder.NO);
          return erToEllerFlereLand && harBostedslandNorge;
        },
        nesteSteg: STEG.ARBEIDSMONSTER,
      },
      {
        beskrivelse: 'to eller flere land',
        exec: avklartefakta => {
          const erToEllerFlereLand = YrkesaktivitetAntallLand.finnAvklaring(avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND);
          const bostedsland = hentFaktaVerdi(hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, avklartefakta));
          const harAvklartBostedsland = !Utils._isNil(bostedsland);
          return erToEllerFlereLand && harAvklartBostedsland;
        },
        nesteSteg: STEG.VEDTAK,
      },
      {
        beskrivelse: 'dead end',
        exec: () => true,
        nesteSteg: null,
      },
    ];

    this.id = STEG.BOSTEDSLAND;
    this.tittel = 'Bosted';
    this.komponent = VurderingBostedsland;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.bosted || [],
      redigerbart: _propsLight.redigerbart,

    });
    this.beregnRelevantUI = _propsLight => {
      const { saksopplysninger = {} } = _propsLight;
      const { sakOgBehandling } = saksopplysninger;
      const { eosBarnetrygd = {} } = sakOgBehandling;

      const bostedslandFakta = hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, _propsLight.avklartefakta);

      const erBegrunnelserPaakrevd = YrkesaktivitetAntallLand.finnAvklaring(_propsLight.avklartefakta, KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND);

      return {
        harAvklaring: Bostedsland.alleErAvklart(bostedslandFakta, erBegrunnelserPaakrevd),
        bostedslandFakta,
        harEOSBarnetrygdSak: eosBarnetrygd,
        erBegrunnelserPaakrevd,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: data => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find(fakta => fakta.referanse === KV.Koder.avklartefaktaKoder.BOSTEDSLAND);

    if (!enkeltFakta) { return false; }
    return enkeltFakta.fakta && enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (bostedslandFakta, begrunnelserPaaKrevd) => {
    const bostedsland = hentFaktaVerdi(bostedslandFakta);
    if (Utils._isNil(bostedsland) || bostedsland === '') {
      return false;
    }
    const { begrunnelseKoder } = bostedslandFakta;

    const begrunnelserErOppgitt = begrunnelseKoder && begrunnelseKoder.length > 0;
    const bosattINorge = bostedsland === MKV.Koder.landkoder.NO;

    if (bosattINorge === true) {
      return true;
    } else if (!begrunnelserPaaKrevd || begrunnelserErOppgitt) {
      return true;
    }

    return false;
  };
}

export default Bostedsland;
