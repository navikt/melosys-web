import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";

import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingMedfolgendeBarn from "../../stegKomponenter/vurderingMedfolgendeBarn";
import { hentFaktaListe } from "../../../../domeneUtils";
import { FLYT_PRODUKSJON_DATO_EØS_11_3_B } from "../../../../utils/dato";
import moment from "moment";

class VesentligVirksomhet extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const vurderingLovvalgBarnFakta = hentFaktaListe(
      MKV.Koder.avklartefaktatyper.VURDERING_LOVVALG_BARN,
      propsLight.avklartefakta,
    );

    const utsendingsvilkårOppfylt = propsLight.utsendingsvilkår?.oppfylt;
    const unntaksvilkårOppfylt = propsLight.unntaksvilkår?.oppfylt;

    const harAvklaring = this.harAvklaring(vurderingLovvalgBarnFakta, propsLight.medfolgendeBarn);

    const NESTE_STEG_FOR_11_3_b = this.beregnNesteStegForFlyt11_3_b(propsLight);

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
        nesteSteg: NESTE_STEG_FOR_11_3_b,
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

  beregnNesteStegForFlyt11_3_b = (propsLight) => {
    const oppsummering = propsLight.oppsummering;

    const behandlingAvsluttetFørNyEndringEØS_11_3_b =
      oppsummering.behandlingsstatus.kode === "AVSLUTTET" &&
      moment(oppsummering.endretDato).isBefore(FLYT_PRODUKSJON_DATO_EØS_11_3_B);

    const innsynsmodusSkalIkkeViseEndringerFraFaktureringAvTrygdeavgift =
      !propsLight.generiskStegRedigerbart && behandlingAvsluttetFørNyEndringEØS_11_3_b;

    if (propsLight.eøsFaktureringAvTrygdeavgiftToggleEnabled) {
      if (innsynsmodusSkalIkkeViseEndringerFraFaktureringAvTrygdeavgift) {
        return STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK;
      }

      return STEG.VURDERING_PERIODE;
    }

    return STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK;
  };
}

export default VesentligVirksomhet;
