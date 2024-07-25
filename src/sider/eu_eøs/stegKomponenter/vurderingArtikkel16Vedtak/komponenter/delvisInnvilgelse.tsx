import MKV from "../../../../../melosyskodeverk";
import { Fragment, ReactElement } from "react";
import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../../felleskomponenter/skjema";
import * as Utils from "../../../../../utils";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../../felleskomponenter/dokumentliste";
import { Periode } from "../../../../../services/api";
import { FormValuesProps } from "../vurderingArtikkel16Vedtak";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../../featuretoggle/toggleNavn";
import DatoOgBestemmelse from "./datoOgBestemmelse";
import VedtakBegrunnelser from "./vedtakBegrunnelser";

interface DelvisInnvilgelseProps {
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
}

const DelvisInnvilgelse = ({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  visOrienteringsbrevArbeidsgiver,
  onPeriodeForkorterUncheck,
  formValues,
  vedKlikkForhandsvis,
  stegErGyldig,
}: DelvisInnvilgelseProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);

  const pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[] = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        {konvensjonStorbritanniaToggleEnabled
          ? "Delvis innvilgelse"
          : "Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1. i deler av søknadsperioden"}
      </Nav.Typo.Innholdstittel>
      <DatoOgBestemmelse fomDato={gjeldendePeriode.fom} tomDato={gjeldendePeriode.tom} />
      <Nav.Row>
        <Nav.Column xs="12">
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
            minDate={Utils.dato.norskStringTilDate(formValues.fomDato)!!}
            maxDate={Utils.dato.norskStringTilDate(formValues.tomDato)}
            tomLabel="Sluttdato"
            tomFeltNavn="tomDato"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <VedtakBegrunnelser anmodningsperiodeSvarType={MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE} />
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
    </Fragment>
  );
};

export default DelvisInnvilgelse;
