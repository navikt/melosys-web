import * as EKV from 'eessi-kodeverk';
import * as KV from '../../../kodeverk';

import MKV from '../../../melosyskodeverk';
import Steg from '../../../felleskomponenter/stegvelger/stegMotor/steg';
import { FANE_STATUS, STEG } from '../../../felleskomponenter/stegvelger/stegMotor/typer';
import VurderingVedtak from '../../../felleskomponenter/stegvelger/stegKomponenter/vurderingVedtak';

class Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.VEDTAK;
    this.tittel = 'Vedtak';
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = _propsLight => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;
      const erNyVurdering = _propsLight.behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
      const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(_propsLight.lovvalgsbestemmelse, MKV.Kodekombinasjoner.alleLovvalg);

      const pdfDokumenter = [
        {
          navn: 'Forhåndsvis vedtaksbrev og A1',
          type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
          data: {
            mottaker: MKV.Koder.aktoersroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        },
      ];

      const visSedLenkeForLovvalgsbestemmelser = [
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
      ];

      if (lovvalgSomKodeTerm &&
          visSedLenkeForLovvalgsbestemmelser.includes(lovvalgSomKodeTerm.kode) &&
          !erNyVurdering) {
        pdfDokumenter.push({
          navn: 'Orienteringsbrev til arbeidsgiver',
          type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
          data: {
            mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
          },
        });
      }

      if (formValues.kreverMottakerinstitusjon &&
        lovvalgSomKodeTerm &&
        lovvalgSomKodeTerm.kode !== MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2) {
        pdfDokumenter.push({ navn: 'Forhåndsvis SED A009', type: EKV.Koder.sedtyper.A009, erSed: true });
      }

      return {
        redigerbart: _propsLight.generiskStegRedigerbart,
        visAntallManederUtland: false,
        pdfDokumenter,
      };
    };
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      lagreOgFatteVedtak: this._propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Vedtak;
