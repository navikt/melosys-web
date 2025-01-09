import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingMedfolgendeBarn from "../../stegKomponenter/vurderingMedfolgendeBarn";
import { hentFaktaListe, hentVilkar } from "../../../../domeneUtils";

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const vurderingLovvalgBarnFakta = hentFaktaListe(
      MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
      propsLight.avklartefakta,
    );

    const art12_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART12_1, propsLight.vilkar);
    const art12_2 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART12_2, propsLight.vilkar);
    const art16_1 = hentVilkar(MKV.Koder.vilkaar.FO_883_2004_ART16_1, propsLight.vilkar);

    const utsendingsvilkårOppfylt = propsLight.konvensjonStorbritanniaToggleEnabled
      ? propsLight.utsendingsvilkår?.oppfylt
      : art12_1.oppfylt || art12_2.oppfylt;
    const unntaksvilkårOppfylt = propsLight.konvensjonStorbritanniaToggleEnabled
      ? propsLight.unntaksvilkår?.oppfylt
      : art16_1.oppfylt;

    const harAvklaring = this.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn);

    this.kriterier = [
      {
        exec: () => harAvklaring && utsendingsvilkårOppfylt,
        nesteSteg: STEG.VEDTAK,
      },
      {
        exec: () => harAvklaring && unntaksvilkårOppfylt,
        nesteSteg: STEG.ARTIKKEL_16_ANMODNING,
      },
      {
        exec: () => harAvklaring && propsLight.erArbeidTjenestepersonEllerFly,
        nesteSteg: STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
      },
    ];

    this.id = STEG.MEDFOLGENDE_BARN;
    this.tittel = "Barn";
    this.komponent = VurderingMedfolgendeBarn;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      vurderingLovvalgBarnFakta,
    });
    this.beregnRelevantUI = (_propsLight) => ({
      harAvklaring,
    });
    this.handlers = {
      bekreftOgFortsett: this._propsLight.tilgjengeligeHandlers.bekreftOgFortsett,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
    };
    this.status = FANE_STATUS.OK;
  }

  harAvklaring = (vurderingLovvalgBarnFakta, mottatteOpplysningerMedfolgendeBarn) =>
    vurderingLovvalgBarnFakta.length === mottatteOpplysningerMedfolgendeBarn.length &&
    vurderingLovvalgBarnFakta.every(
      (enkeltFakta) =>
        enkeltFakta.fakta.includes(BOOLSK_STRING.SANN) ||
        (enkeltFakta.fakta.includes(BOOLSK_STRING.USANN) && enkeltFakta.begrunnelseKoder.length > 0),
    );
}

export default VesentligVirksomhet;
