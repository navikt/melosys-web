import MKV from '../../../melosyskodeverk';
import * as KV from '../../../kodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingBostedsland from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingBostedsland';

import { hentFakta, hentFaktaVerdi } from '../../../regler/avklartefakta';
import SokkelSkip from './sokkel_skip';
import * as Utils from '../../../utils';


class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const erSokkalSkipEttLand = SokkelSkip.finnAvklaring(propsLight.avklartefakta, KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND);

    this.kriterier = [
      {
        exec: () => erSokkalSkipEttLand,
        nesteSteg: STEG.ARTIKKEL_11_4,
      },
      {
        exec: avklartefakta => {
          const harBostedslandNorge = Bostedsland.finnAvklaring(avklartefakta, MKV.Koder.landkoder.NO);
          return harBostedslandNorge;
        },
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: avklartefakta => {
          const bostedsfakta = hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, avklartefakta);
          const bostedsland = hentFaktaVerdi(bostedsfakta);
          const { begrunnelseKoder = [] } = bostedsfakta;
          const begrunnelserErOppgitt = begrunnelseKoder.length > 0;
          const harAvklartBostedsland = !Utils._isNil(bostedsland);
          return harAvklartBostedsland && begrunnelserErOppgitt;
        },
        nesteSteg: STEG.VIDERESEND,
      },
    ];

    this.id = STEG.BOSTEDSLAND;
    this.tittel = 'Bosted';
    this.komponent = VurderingBostedsland;
    this.samleRelevanteData = _propsLight => ({
      begrunnelser: _propsLight.begrunnelser.bosted || [],
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = _propsLight => {
      const { saksopplysninger = {} } = _propsLight;
      const { sakOgBehandling } = saksopplysninger;
      const { eosBarnetrygd = {} } = sakOgBehandling;

      const bostedslandFakta = hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, _propsLight.avklartefakta);

      const erBegrunnelserPaakrevd = !Bostedsland.finnAvklaring(_propsLight.avklartefakta, MKV.Koder.landkoder.NO) && !erSokkalSkipEttLand;

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
