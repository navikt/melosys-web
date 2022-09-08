import React, { Fragment } from "react";
import PT from "prop-types";

import * as MPT from "../../../../proptypes";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import DatoOmrade from "../../../../felleskomponenter/datoOmrade";
import * as Skjema from "../../../../felleskomponenter/skjema";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";

export const Innvilgelse = ({
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
}) => {
  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev og A1",
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
      data: {
        fritekst: vedtaksbrevFritekst,
        mottaker: MKV.Koder.aktoersroller.BRUKER,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Brev til arbeidsgiver",
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
      data: {
        mottaker: MKV.Koder.aktoersroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Undertittel>
        Omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1.
      </Nav.Typo.Undertittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
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
            tomLabel="Sluttdato"
            tomFeltNavn="tomDato"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {stegErGyldig && (
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />
          )}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

Innvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  vedtaksbrevFritekst: PT.string,
  renderFritekstFelt: PT.func.isRequired,
  visOrienteringsbrevArbeidsgiver: PT.bool.isRequired,
  onPeriodeForkorterUncheck: PT.func.isRequired,
  formValues: PT.object.isRequired,
  vedKlikkForhandsvis: PT.func.isRequired,
  stegErGyldig: PT.bool.isRequired,
};

Innvilgelse.defaultProps = {
  vedtaksbrevFritekst: undefined,
};
