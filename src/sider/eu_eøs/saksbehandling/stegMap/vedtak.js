import * as EKV from "eessi-kodeverk";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingVedtak from "../../stegKomponenter/vurderingVedtak";

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
    this.tittel = "Vedtak";
    this.komponent = VurderingVedtak;
    this.samleRelevanteData = (_propsLight) => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;
      const erNyVurdering = _propsLight.behandlingstype.kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
      const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(
        _propsLight.valgteLovvalgsVilkarBestemmelse,
        MKV.Kodekombinasjoner.alleLovvalg
      );

      const pdfDokumenter = [
        {
          navn: "Forhåndsvis vedtaksbrev og A1",
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

      if (
        lovvalgSomKodeTerm &&
        visSedLenkeForLovvalgsbestemmelser.includes(lovvalgSomKodeTerm.kode) &&
        !erNyVurdering
      ) {
        pdfDokumenter.push({
          navn: "Orienteringsbrev til arbeidsgiver",
          type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
          data: {
            mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
          },
        });
      }

      const erArtikkel12Lovvalgsbestemmelse = (lovvalgKTObject) => {
        if (!lovvalgKTObject) return false;

        return (
          lovvalgKTObject.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2 ||
          lovvalgKTObject.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1
        );
      };

      if (formValues.kreverMottakerinstitusjon) {
        if (erArtikkel12Lovvalgsbestemmelse(lovvalgSomKodeTerm)) {
          pdfDokumenter.push({
            navn: "Forhåndsvis SED A009",
            type: EKV.Koder.sedtyper.A009,
            erSed: true,
            data: {
              fritekst: formValues.fritekstSed,
            },
          });
        } else {
          pdfDokumenter.push({
            navn: "Forhåndsvis SED A010",
            type: EKV.Koder.sedtyper.A010,
            erSed: true,
            data: {
              fritekst: formValues.fritekstSed,
            },
          });
        }
      }

      return {
        redigerbart: _propsLight.generiskStegRedigerbart,
        visAntallManederUtland: false,
        pdfDokumenter,
        harFeilmeldinger: _propsLight.harFeilmeldinger,
      };
    };
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      lagreOgFatteVedtak: propsLight.tilgjengeligeHandlers.lagreOgFatteVedtak,
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Vedtak;
