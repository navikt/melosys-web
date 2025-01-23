import MKV from "../../../../../melosyskodeverk";
import { Fragment, ReactElement } from "react";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../../felleskomponenter/skjema";
import * as Utils from "../../../../../utils";
import { Periode } from "../../../../../services/api";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../../felleskomponenter/dokumentliste";
import { FormValuesProps } from "../vurderingArtikkel16Vedtak";
import DatoOgBestemmelse from "./datoOgBestemmelse";
import * as Api from "../../../../../services/api";
import { useSelector } from "react-redux";
import { fagsakSelectors } from "../../../../../ducks/fagsaker";
import { avklartefaktaSelectors } from "../../../../../ducks/avklartefakta";
import { VurderingYrkesaktivitetTyper } from "../../../../../kodeverk/koder";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";

interface InnvilgelseProps {
  redigerbart: boolean;
  behandlingID: number;
  gjeldendePeriode: Partial<Periode>;
  vedtaksbrevFritekst?: string;
  renderFritekstFelt: () => ReactElement;
  visOrienteringsbrevArbeidsgiver: boolean;
  onPeriodeForkorterUncheck: () => void;
  formValues: FormValuesProps;
  vedKlikkForhandsvis: () => Promise<boolean>;
  stegErGyldig: boolean;
  erStorbrittaniaArt18_1Bestemmelse: boolean;
  erUtsendt: boolean;
}

function Innvilgelse({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  renderFritekstFelt,
  vedtaksbrevFritekst,
  visOrienteringsbrevArbeidsgiver,
  onPeriodeForkorterUncheck,
  formValues,
  vedKlikkForhandsvis,
  stegErGyldig,
  erStorbrittaniaArt18_1Bestemmelse,
  erUtsendt,
}: InnvilgelseProps) {
  const saksnummer = useSelector(fagsakSelectors.SaksnummerSelector) as string;
  const pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[] = [];

  const selvstendigeVirksomheter = useSelector(mottatteOpplysningerSelectors.SelvstendigNaringsvirksomhetSelector);
  const avklartVirksomhet = useSelector(avklartefaktaSelectors.AvklarteVirksomheterSelector)[0];
  const erSelvstendigVirksomhet =
    selvstendigeVirksomheter.find((virksomhet: any) => virksomhet.orgnr === avklartVirksomhet.virksomhetId) !==
    undefined;

  const erSelvstendigNaeringsdrivende =
    useSelector(avklartefaktaSelectors.YrkesaktivitetSelector) ===
      VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE || erSelvstendigVirksomhet;

  if (erUtsendt && erStorbrittaniaArt18_1Bestemmelse) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_EFTA_STORBRITANNIA,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        begrunnelseFritekst: vedtaksbrevFritekst,
      },
    });
    if (!erSelvstendigNaeringsdrivende) {
      pdfDokumenter.push({
        dokumentData: {
          produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
          erInnvilgelse: true,
          mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
        },
      });
    }
    Api.Fagsaker.aktoer.hent(saksnummer, MKV.Koder.aktoersroller.FULLMEKTIG).then((fullmektigListe) => {
      if (
        fullmektigListe?.length > 0 &&
        fullmektigListe?.find((fullmektig) =>
          fullmektig.fullmakter?.includes(MKV.Koder.fullmaktstype.FULLMEKTIG_SØKNAD),
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
        fritekst: vedtaksbrevFritekst,
      },
    });

    if (visOrienteringsbrevArbeidsgiver && !erSelvstendigNaeringsdrivende) {
      pdfDokumenter.push({
        dokumentData: {
          produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
          erInnvilgelse: true,
          mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
        },
      });
    } else if (visOrienteringsbrevArbeidsgiver) {
      pdfDokumenter.push({
        dokumentData: {
          produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
          mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
        },
      });
    }
  }

  return (
    <>
      <Nav.Heading level="1" className="stegvelgertittel">
        Omfattet av norsk trygdelovgivning
      </Nav.Heading>
      <DatoOgBestemmelse fomDato={gjeldendePeriode.fom} tomDato={gjeldendePeriode.tom} />
      <Nav.Row>
        <Nav.Column xs="7">
          <Skjema.PeriodeForkorter
            redigerbart={redigerbart}
            fomRedigerbar
            checkboxClassName="forkortLovvalgsperiode"
            checkboxLabel="Lovvalget innvilges for en kortere periode"
            checkboxFeltnavn="forkortLovvalgsperiode"
            onUncheck={onPeriodeForkorterUncheck}
            forkortPeriode={formValues.forkortLovvalgsperiode}
            fomLabel="Startdato"
            fomFeltNavn="fomDato"
            minDate={Utils.dato.norskStringTilDate(formValues.fomDato)!}
            maxDate={Utils.dato.norskStringTilDate(formValues.tomDato)}
            tomLabel="Sluttdato"
            tomFeltNavn="tomDato"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      {stegErGyldig && (
        <Nav.Row>
          <Nav.Column xs="10">
            <Dokumentliste
              behandlingID={behandlingID}
              dokumenter={pdfDokumenter}
              validateOnClick={vedKlikkForhandsvis}
            />
          </Nav.Column>
        </Nav.Row>
      )}
    </>
  );
}

export default Innvilgelse;
