import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { STEG, FANE_STATUS } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVedtak from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVedtak';

class GodkjennUtpekingNorge extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.GODKJENN_UTPEKING_NORGE;
    this.tittel = 'Vedtak';
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = _propsLight => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;

      const pdfDokumenter = [
        {
          navn: 'Forhåndsvis vedtaksbrev og A1',
          type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV_FLERE_LAND,
          data: {
            mottaker: MKV.Koder.aktoersroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        },
        {
          navn: 'Forhåndsvis SED A012',
          type: EKV.Koder.sedtyper.A012,
          erSed: true,
          data: {
            fritekst: formValues.fritekstSed,
          },
        },
      ];

      return {
        redigerbart: _propsLight.generiskStegRedigerbart,
        visAntallManederUtland: false,
        pdfDokumenter,
      };
    };
    this.beregnRelevantUI = _propsLight => {
      const harAvklaring = true;

      return ({
        harAvklaring,
      });
    };
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this._status = FANE_STATUS.OK;
  }
}

export default GodkjennUtpekingNorge;
