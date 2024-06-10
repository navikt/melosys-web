import * as EKV from "eessi-kodeverk";

import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { STEG, FANE_STATUS } from "../../../../felleskomponenter/stegvelger";
import VurderingVedtak from "../../stegKomponenter/vurderingVedtak";

class GodkjennUtpekingNorge extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.GODKJENN_UTPEKING_NORGE;
    this.tittel = "Vedtak";
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = (_propsLight) => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;

      const pdfDokumenter = [
        {
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV_FLERE_LAND,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        },
        {
          sedType: EKV.Koder.sedtyper.A012,
          sedData: {
            fritekst: formValues.fritekstSed,
          },
        },
      ];

      return {
        redigerbart: _propsLight.generiskStegRedigerbart,
        pdfDokumenter,
        harFeilmeldinger: _propsLight.harFeilmeldinger,
      };
    };
    this.beregnRelevantUI = (_propsLight) => {
      const harAvklaring = true;

      return {
        harAvklaring,
      };
    };
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      validerMottatteOpplysninger: propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default GodkjennUtpekingNorge;
