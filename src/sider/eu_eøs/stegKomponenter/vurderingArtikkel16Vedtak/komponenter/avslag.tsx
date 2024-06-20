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

interface AvslagProps {
  redigerbart: boolean;
  behandlingID: number;
  vedtaksbrevFritekst?: string;
  renderFritekstFelt: () => ReactElement;
  visOrienteringsbrevArbeidsgiver: boolean;
  gjeldendePeriode: Partial<Periode>;
}

export const Avslag = ({
  redigerbart,
  behandlingID,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  visOrienteringsbrevArbeidsgiver,
  gjeldendePeriode,
}: AvslagProps) => {
  const pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[] = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Avslag</Nav.Typo.Innholdstittel>
      <DatoOgBestemmelse fomDato={gjeldendePeriode.fom} tomDato={gjeldendePeriode.tom} />
      <Nav.Row>
        <Nav.Column xs="7">
          <VedtakBegrunnelser anmodningsperiodeSvarType={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};
