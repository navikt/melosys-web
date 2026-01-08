import Steg from "../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../felleskomponenter/stegvelger";
import VurderingInngang from "../stegKomponenter/vurderingInngang/vurderingInngang";

import MKV from "../../../melosyskodeverk";

class Inngang extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.INNGANG;
    this.tittel = "Inngang";
    this.komponent = VurderingInngang;
    this.samleRelevanteData = (_propsLight) => {
      const inngangsvilkaar = this.hentInngangsvilkaar(_propsLight);

      return {
        redigerbart: _propsLight.generiskStegRedigerbart,
        oppfyllerInngangsvilkar: this.oppfyllerInngangsvilkaar(inngangsvilkaar),
        inngangsvilkaar,
      };
    };
    this.beregnRelevantUI = (_propsLight) => {
      const harAvklaring = this.harAvklaring(_propsLight);

      return {
        harAvklaring,
      };
    };
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
    };
    this.status = FANE_STATUS.OK;
  }

  hentInngangsvilkaar = (propsLight) =>
    propsLight.vilkar?.find((enkelt) => enkelt.vilkaar === MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR);

  harAvklaring = (propsLight) => {
    const inngangsvilkaar = this.hentInngangsvilkaar(propsLight);
    return this.oppfyllerInngangsvilkaar(inngangsvilkaar);
  };

  oppfyllerInngangsvilkaar = (inngangsvilkaar) => inngangsvilkaar?.oppfylt;
}

export default Inngang;
