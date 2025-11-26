import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingBostedsland from "../../stegKomponenter/vurderingBostedsland";

import { hentFakta, hentFaktaVerdi } from "../../../../domeneUtils";
import SokkelSkip from "./sokkel_skip";
import * as Utils from "../../../../utils";

class Bostedsland extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const erSokkelSkipEttLand = SokkelSkip.finnAvklaring(
      propsLight.avklartefakta,
      KV.Koder.VurderingSokkelSkipTyper.SKIP_ETT_LAND,
    );

    const bostedslandFakta = hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, propsLight.avklartefakta);

    const erBegrunnelserPaakrevd =
      !Bostedsland.finnAvklaring(propsLight.avklartefakta, MKV.Koder.landkoder.NO) && !erSokkelSkipEttLand;

    const harAvklaring = Bostedsland.alleErAvklart(bostedslandFakta, erBegrunnelserPaakrevd);

    this.kriterier = [
      {
        exec: () => erSokkelSkipEttLand && harAvklaring,
        nesteSteg: STEG.ARTIKKEL_11_4,
      },
      {
        exec: (avklartefakta) => {
          const harBostedslandNorge = Bostedsland.finnAvklaring(avklartefakta, MKV.Koder.landkoder.NO);
          return harBostedslandNorge;
        },
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: (avklartefakta) => {
          const bostedsfakta = hentFakta(KV.Koder.avklartefaktaKoder.BOSTEDSLAND, avklartefakta);
          const bostedsland = hentFaktaVerdi(bostedsfakta);
          const { begrunnelseKoder = [] } = bostedsfakta;
          const begrunnelserErOppgitt = begrunnelseKoder.length > 0;
          return bostedsland && begrunnelserErOppgitt;
        },
        nesteSteg: STEG.VIDERESEND,
      },
    ];

    this.id = STEG.BOSTEDSLAND;
    this.tittel = "Bosted";
    this.komponent = VurderingBostedsland;
    this.samleRelevanteData = (_propsLight) => ({
      begrunnelser: _propsLight.begrunnelser.bosted || [],
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => {
      return {
        harAvklaring,
        bostedslandFakta,
        erBegrunnelserPaakrevd,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find((fakta) => fakta.referanse === KV.Koder.avklartefaktaKoder.BOSTEDSLAND);

    if (!enkeltFakta) {
      return false;
    }
    return enkeltFakta.fakta && enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };

  static alleErAvklart = (bostedslandFakta, begrunnelserPaaKrevd) => {
    const bostedsland = hentFaktaVerdi(bostedslandFakta);
    if (Utils._isNil(bostedsland) || bostedsland === "") {
      return false;
    }
    const { begrunnelseKoder } = bostedslandFakta;

    const begrunnelserErOppgitt = begrunnelseKoder && begrunnelseKoder.length > 0;
    const bosattINorge = bostedsland === MKV.Koder.landkoder.NO;

    if (bosattINorge === true) {
      return true;
    }
    if (!begrunnelserPaaKrevd || begrunnelserErOppgitt) {
      return true;
    }

    return false;
  };
}

export default Bostedsland;
