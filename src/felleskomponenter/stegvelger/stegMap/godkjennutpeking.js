import * as EKV from 'eessi-kodeverk';

import MKV from '../../../melosyskodeverk';
import Steg from '../../stegvelger/stegMotor/steg';
import { STEG, FANE_STATUS } from '../../stegvelger/stegMotor/typer';
import VurderingVedtak from '../stegKomponenter/vurderingVedtak';

class GodkjennUtpeking extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);

    this.kriterier = [];
    this.id = STEG.GODKJENN_UTPEKING;
    this.tittel = 'Vedtak';
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = _propsLight => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;

      const pdfDokumenter = [
        {
          navn: 'Forhåndsvis vedtaksbrev og A1',
          type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
          data: {
            mottaker: MKV.Koder.aktoersroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        },
        {
          navn: 'Forhåndsvis SED A012',
          type: EKV.Koder.sedtyper.A012,
          erSed: true,
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

export default GodkjennUtpeking;
