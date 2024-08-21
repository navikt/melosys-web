import * as EKV from "eessi-kodeverk";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingVedtak from "../../stegKomponenter/vurderingVedtak/vurderingVedtak";
import { erStorbritanniaKonvBestemmelse } from "../../../../melosyskodeverk/utils";

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
      const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(
        _propsLight.valgteLovvalgsVilkarBestemmelse,
        MKV.Kodekombinasjoner.alleLovvalg
      );

      const erUtsendt =
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER === _propsLight.behandlingstema.kode ||
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG === _propsLight.behandlingstema.kode;

      const erStorbritanniaBestemmelse = erStorbritanniaKonvBestemmelse(_propsLight.lovvalgsbestemmelse);

      const visSedLenkeForLovvalgsbestemmelser = [
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_1,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART16_1,
      ];

      const artikkel11_4Bestemmelser = [
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
        MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_4_2,
        MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_4_1,
      ];

      const erArtikkel11_4 =
        artikkel11_4Bestemmelser.includes(propsLight.lovvalgsbestemmelse) ||
        artikkel11_4Bestemmelser.includes(propsLight.tilleggsbestemmelse);

      const pdfDokumenter = [];
      if (erUtsendt && erStorbritanniaBestemmelse && _propsLight.konvensjonStorbritanniaToggleEnabled) {
        pdfDokumenter.push({
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_EFTA_STORBRITANNIA,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        });
        if (!erArtikkel11_4) {
          pdfDokumenter.push({
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
              erInnvilgelse: true,
              mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
            },
          });
        }
        pdfDokumenter.push({
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
          },
        });
      } else {
        pdfDokumenter.push({
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        });
        if (propsLight.konvensjonStorbritanniaToggleEnabled && lovvalgSomKodeTerm && formValues?.kopiTilArbeidsgiver) {
          pdfDokumenter.push({
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
              erInnvilgelse: true,
              mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
            },
          });
        } else if (
          lovvalgSomKodeTerm &&
          visSedLenkeForLovvalgsbestemmelser.includes(lovvalgSomKodeTerm.kode) &&
          formValues?.kopiTilArbeidsgiver
        ) {
          pdfDokumenter.push({
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
              mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
            },
          });
        }
      }

      const erArtikkelForUtsending = (lovvalgKTObject) => {
        if (!lovvalgKTObject) return false;

        return [
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2,
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_1,
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_2,
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART16_1,
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART16_3,
        ].includes(lovvalgKTObject.kode);
      };

      if (formValues.kreverMottakerinstitusjon) {
        if (erArtikkelForUtsending(lovvalgSomKodeTerm)) {
          pdfDokumenter.push({
            sedType: EKV.Koder.sedtyper.A009,
            sedData: {
              fritekst: formValues.fritekstSed,
            },
          });
        } else {
          pdfDokumenter.push({
            sedType: EKV.Koder.sedtyper.A010,
            sedData: {
              fritekst: formValues.fritekstSed,
            },
          });
        }
      }

      return {
        redigerbart: _propsLight.generiskStegRedigerbart,
        pdfDokumenter,
        harFeilmeldinger: _propsLight.harFeilmeldinger,
      };
    };
    this.beregnRelevantUI = () => ({});
    this.handlers = {
      tilbake: propsLight.tilgjengeligeHandlers.tilbake,
      validerMottatteOpplysninger: propsLight.tilgjengeligeHandlers.validerMottatteOpplysninger,
    };
    this.status = FANE_STATUS.OK;
  }
}

export default Vedtak;
