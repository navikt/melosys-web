import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingArbeidEttLandOvrigVedtak from "../../stegKomponenter/vurderingArbeidEttLandOvrigVedtak";

import { hentFakta } from "../../../../domeneUtils";

import MKV from "../../../../melosyskodeverk";

class ArbeidEttLandOvrigVedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    const lovvalgsbestemmelseSomSkalVises =
      propsLight.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A
        ? MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
        : propsLight.lovvalgsbestemmelse;

    const lovvalgsbestemmelseSomSkalLagres = propsLight.lovvalgsbestemmelse;

    const informertMyndighetFakta = hentFakta(
      MKV.Koder.avklartefaktatyper.INFORMERT_MYNDIGHET,
      propsLight.avklartefakta
    );

    this.kriterier = [];
    this.id = STEG.ARBEID_ETT_LAND_OVRIG_VEDTAK;
    this.tittel = "Vedtak";
    this.komponent = VurderingArbeidEttLandOvrigVedtak;
    this.samleRelevanteData = (_propsLight) => ({
      redigerbart: _propsLight.generiskStegRedigerbart,
      lovvalgsbestemmelseSomSkalVises,
      lovvalgsbestemmelseSomSkalLagres,
      informertMyndighetFakta,
      harFeilmeldinger: _propsLight.harFeilmeldinger,
    });
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      lagreLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.lagreLovvalgsperioder,
      byggLovvalgsperioder: this._propsLight.tilgjengeligeHandlers.byggLovvalgsperioder,
      oppdaterData: (felt, verdi) => this._propsLight.tilgjengeligeHandlers.oppdaterStegData(this.id, felt, verdi),
      slettData: (data) => this._propsLight.tilgjengeligeHandlers.slettStegData(this.id, data),
      kontrollerFerdigbehandling: this._propsLight.tilgjengeligeHandlers.kontrollerFerdigbehandling,
      validerMottatteOpplysninger: this._propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default ArbeidEttLandOvrigVedtak;
