import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingYrkesgruppe from "../../stegKomponenter/vurderingYrkesgruppe";
import * as KV from "../../../../kodeverk";
import * as Utils from "../../../../utils";
import { hentFakta, hentTilleggBestemmelse } from "../../../../domeneUtils";

const { ORDINAER, FLYENDE_PERSONELL, ORDINAER_UTEN_ART12, SOKKEL_ELLER_SKIP } = KV.Koder.VurderingYrkesgruppeTyper;

class Yrkesgruppe extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const tilleggbestemmelse = hentTilleggBestemmelse(propsLight.lovvalgsperioder);
    const yrkesgruppe = hentFakta(KV.Koder.avklartefaktaKoder.YRKESGRUPPE, propsLight.avklartefakta);
    const vilkårManglerForDirekteTilAnmodning =
      yrkesgruppe?.fakta?.[0] === ORDINAER_UTEN_ART12 && !propsLight.unntaksvilkår.oppfylt;
    const harAvklaring = !Utils._isEmpty(yrkesgruppe.fakta) && !vilkårManglerForDirekteTilAnmodning;

    this.kriterier = [
      {
        exec: (avklartefakta) =>
          (Yrkesgruppe.finnAvklaring(avklartefakta, ORDINAER) ||
            Yrkesgruppe.finnAvklaring(avklartefakta, FLYENDE_PERSONELL) ||
            Yrkesgruppe.finnAvklaring(avklartefakta, ORDINAER_UTEN_ART12)) &&
          harAvklaring,
        nesteSteg: STEG.VIRKSOMHETER,
      },
      {
        exec: (avklartefakta) => Yrkesgruppe.finnAvklaring(avklartefakta, SOKKEL_ELLER_SKIP) && harAvklaring,
        nesteSteg: STEG.SOKKEL_SKIP,
      },
    ];
    this.id = STEG.YRKESGRUPPE;
    this.tittel = "Yrkes\u00ADsituasjon";
    this.komponent = VurderingYrkesgruppe;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      tilleggbestemmelse,
      harAvklaring,
      yrkesgruppe,
    });
    this.handlers = {
      bekreftOgFortsett: propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  static finnAvklaring = (avklartefakta, typeSomSkalSjekkes) => {
    const enkeltFakta = avklartefakta.find((fakta) => fakta.referanse === STEG.YRKESGRUPPE);
    if (!enkeltFakta) {
      return false;
    }
    return enkeltFakta.fakta.includes(typeSomSkalSjekkes);
  };
}

export default Yrkesgruppe;
