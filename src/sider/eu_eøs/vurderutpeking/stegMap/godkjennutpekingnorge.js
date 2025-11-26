import * as EKV from "eessi-kodeverk";

import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/stegLegacy";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingVedtak from "../../stegKomponenter/vurderingVedtak/vurderingVedtak";

class GodkjennUtpekingNorge extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.GODKJENN_UTPEKING_NORGE;
    this.tittel = "Vedtak";
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = (_propsLight) => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;

      const pdfDokumenterNorgeErUtpekt11_3_a = [
        {
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_EFTA_STORBRITANNIA,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        },
        {
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
          },
        },
        {
          sedType: EKV.Koder.sedtyper.A012,
          sedData: {
            fritekst: formValues.fritekstSed,
          },
        },
      ];

      const pdfDokumenterGodkjennUtpekingNorge = [
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

      const pdfDokumenter =
        _propsLight.norgeErUtpekt11_3AToggleEnabled &&
        _propsLight.lovvalgsbestemmelse ===
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A
          ? pdfDokumenterNorgeErUtpekt11_3_a
          : pdfDokumenterGodkjennUtpekingNorge;

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
