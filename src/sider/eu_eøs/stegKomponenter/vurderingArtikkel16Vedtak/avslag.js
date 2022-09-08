import React, { Fragment } from "react";
import PT from "prop-types";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";

export const Avslag = ({
  redigerbart,
  behandlingID,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  renderBegrunnelser,
  visOrienteringsbrevArbeidsgiver,
}) => {
  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev",
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
      data: {
        fritekst: vedtaksbrevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Brev til arbeidsgiver",
      type: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Undertittel>Avslag</Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">{renderBegrunnelser()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

Avslag.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  vedtaksbrevFritekst: PT.string,
  renderFritekstFelt: PT.func.isRequired,
  renderBegrunnelser: PT.func.isRequired,
  visOrienteringsbrevArbeidsgiver: PT.bool.isRequired,
};

Avslag.defaultProps = {
  vedtaksbrevFritekst: undefined,
};
