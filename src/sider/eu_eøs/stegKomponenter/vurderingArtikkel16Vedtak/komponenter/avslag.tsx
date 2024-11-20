import MKV from "../../../../../melosyskodeverk";
import { Fragment, ReactElement } from "react";
import * as Nav from "../../../../../navFrontend";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../../felleskomponenter/dokumentliste";
import VedtakBegrunnelser from "./vedtakBegrunnelser";
import { Periode } from "../../../../../services/modules/types";
import DatoOgBestemmelse from "./datoOgBestemmelse";
import { useFeatureToggle } from "../../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../../featuretoggle/toggleNavn";

interface AvslagProps {
  redigerbart: boolean;
  behandlingID: number;
  vedtaksbrevFritekst?: string;
  renderFritekstFelt: () => ReactElement;
  visOrienteringsbrevArbeidsgiver: boolean;
  gjeldendePeriode: Partial<Periode>;
  erStorbrittaniaArt18_1Bestemmelse: boolean;
}

export const Avslag = ({
  redigerbart,
  behandlingID,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  visOrienteringsbrevArbeidsgiver,
  gjeldendePeriode,
  erStorbrittaniaArt18_1Bestemmelse,
}: AvslagProps) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);

  const pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[] = [
    {
      dokumentData: {
        produserbardokument: erStorbrittaniaArt18_1Bestemmelse
          ? MKV.Koder.brev.produserbaredokumenter.AVSLAG_EFTA_STORBRITANNIA
          : MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
  ];

  if (konvensjonStorbritanniaToggleEnabled && visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.ORIENTERING_TIL_ARBEIDSGIVER_OM_VEDTAK,
        erInnvilgelse: false,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  } else if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Heading size="large" className="stegvelgertittel">
        Avslag
      </Nav.Heading>
      <DatoOgBestemmelse fomDato={gjeldendePeriode.fom} tomDato={gjeldendePeriode.tom} />
      <Nav.Row>
        <Nav.Column xs="7">
          <VedtakBegrunnelser anmodningsperiodeSvarType={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      {redigerbart && (
        <Nav.Row>
          <Nav.Column xs="10">
            <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />
          </Nav.Column>
        </Nav.Row>
      )}
    </Fragment>
  );
};
