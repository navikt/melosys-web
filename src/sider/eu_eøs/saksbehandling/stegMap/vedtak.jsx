import * as EKV from "eessi-kodeverk";
import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import Steg from "../../../../felleskomponenter/stegvelger/stegMotor/steg";
import { FANE_STATUS, STEG } from "../../../../felleskomponenter/stegvelger";
import VurderingVedtak from "../../stegKomponenter/vurderingVedtak/vurderingVedtak";
import { VurderingVedtak11_3_og_13_3a } from "../../stegKomponenter/vurderingVedtak11_3_og_13_3a/vurderingVedtak11_3_og_13_3a";
import { erStorbritanniaKonvBestemmelse } from "../../../../melosyskodeverk/utils";
import { VurderingYrkesaktivitetTyper } from "../../../../kodeverk/koder";

class Vedtak extends Steg {
  constructor(propsLight, stegPosisjon) {
    super(propsLight, stegPosisjon);
    const erUtsendt =
      MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER === propsLight.behandlingstema.kode ||
      MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG === propsLight.behandlingstema.kode;

    const erOrdinaerYrkesgruppe =
      propsLight.avklartefakta.find(
        (avklartfakta) =>
          avklartfakta.avklartefaktaKode === MKV.Koder.avklartefaktatyper.YRKESGRUPPE &&
          avklartfakta.fakta[0] === MKV.Koder.yrker.yrkesgrupper.ORDINAER
      ) !== undefined;
    const skalViseArbeidKunNorgeFlyt =
      (erUtsendt || propsLight.behandlingstema.kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE) &&
      erOrdinaerYrkesgruppe &&
      propsLight.arbeidKunNorgeToggleEnabled;
    this.kriterier = [
      {
        exec: () => true,
        nesteSteg: false,
      },
    ];
    this.id = STEG.VEDTAK;
    this.tittel = "Vedtak";
    this.komponent = skalViseArbeidKunNorgeFlyt ? VurderingVedtak11_3_og_13_3a : VurderingVedtak;
    this.samleRelevanteData = (_propsLight) => {
      const formValues = _propsLight.artikkel12_vedtak_skjema;
      const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(
        _propsLight.valgteLovvalgsVilkarBestemmelse,
        MKV.Kodekombinasjoner.alleLovvalg
      );

      const erStorbritanniaBestemmelse = erStorbritanniaKonvBestemmelse(_propsLight.lovvalgsbestemmelse);
      const { UTSENDT_ARBEIDSTAKER, ARBEID_TJENESTEPERSON_ELLER_FLY } = MKV.Koder.behandlinger.behandlingstema;

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

      const erSelvstendigNaeringsdrivende =
        propsLight.avklartefakta.find((avklartfakta) =>
          avklartfakta.fakta.includes(VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE)
        ) != null;

      if (
        (erUtsendt && erStorbritanniaBestemmelse && _propsLight.konvensjonStorbritanniaToggleEnabled) ||
        skalViseArbeidKunNorgeFlyt
      ) {
        pdfDokumenter.push({
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_EFTA_STORBRITANNIA,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            fritekst: formValues.vedtaksbrevFritekst,
          },
        });
        if (
          !erArtikkel11_4 &&
          [UTSENDT_ARBEIDSTAKER, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(propsLight.behandlingstema.kode) &&
          !erSelvstendigNaeringsdrivende
        ) {
          pdfDokumenter.push({
            dokumentData: {
              produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
              erInnvilgelse: true,
              mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
            },
          });
        }
        _propsLight.tilgjengeligeHandlers.hentFullmektig().then((fullmektigListe) => {
          if (
            fullmektigListe?.length > 0 &&
            fullmektigListe?.find((fullmektig) =>
              fullmektig.fullmakter?.includes(MKV.Koder.fullmaktstype.FULLMEKTIG_SØKNAD)
            )
          ) {
            pdfDokumenter.push({
              dokumentData: {
                produserbardokument: MKV.Koder.brev.produserbaredokumenter.ATTEST_A1,
                mottaker: MKV.Koder.mottakerroller.FULLMEKTIG,
              },
            });
          }
        });

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
          if (
            !erArtikkel11_4 &&
            [UTSENDT_ARBEIDSTAKER, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(propsLight.behandlingstema.kode) &&
            !erSelvstendigNaeringsdrivende
          ) {
            pdfDokumenter.push({
              dokumentData: {
                produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
                erInnvilgelse: true,
                mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
              },
            });
          }
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
        erArtikkel11_4,
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
