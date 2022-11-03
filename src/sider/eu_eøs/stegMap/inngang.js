import Steg from "../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../felleskomponenter/stegvelger";
import VurderingInngang from "../stegKomponenter/vurderingInngang";

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
        alleLandkoder: _propsLight.landkoder,
        avklartefakta: _propsLight.avklartefakta,
        redigerbart: _propsLight.generiskStegRedigerbart,
        oppfyllerInngangsvilkar: this.oppfyllerInngangsvilkaar(inngangsvilkaar),
        inngangsvilkaar,
        landkoder: _propsLight.mottatteOpplysninger.soeknadsland.landkoder,
        behandlingstema: _propsLight.behandlingstema.kode,
      };
    };
    this.beregnRelevantUI = (_propsLight) => {
      const harAvklaring = this.harAvklaring(_propsLight);

      return {
        harAvklaring,
      };
    };
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
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
