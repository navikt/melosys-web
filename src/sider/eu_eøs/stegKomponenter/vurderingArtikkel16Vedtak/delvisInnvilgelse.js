import React, { Fragment } from "react";
import PT from "prop-types";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import DatoOmrade from "../../../../felleskomponenter/datoOmrade";
import * as Skjema from "../../../../felleskomponenter/skjema";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";
import * as MPT from "../../../../proptypes";

export const DelvisInnvilgelse = ({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  renderBegrunnelser,
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
        Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1. i deler av
        søknadsperioden
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
        <Nav.Column xs="7">{renderBegrunnelser()}</Nav.Column>
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

DelvisInnvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  vedtaksbrevFritekst: PT.string,
  renderFritekstFelt: PT.func.isRequired,
  renderBegrunnelser: PT.func.isRequired,
  visOrienteringsbrevArbeidsgiver: PT.bool.isRequired,
  onPeriodeForkorterUncheck: PT.func.isRequired,
  formValues: PT.object.isRequired,
  vedKlikkForhandsvis: PT.func.isRequired,
  stegErGyldig: PT.bool.isRequired,
};

DelvisInnvilgelse.defaultProps = {
  vedtaksbrevFritekst: undefined,
};
