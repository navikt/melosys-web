import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

const Vedtak = props => (
  <div>
    <Nav.Container fluid>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Undertittel>Foreslått vedtak:</Nav.Undertittel>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Normaltekst type="normaltekst">Resultat:</Nav.Normaltekst>
          <Nav.UndertekstBold>Medlemsskap i norsk folketrygd er innvilget, etter artikkel 12.1</Nav.UndertekstBold>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6" md="3">
          <Nav.Element type="element">Antall måneder i utlandet</Nav.Element>
          <Nav.Normaltekst>11</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="6" md="3">
          <Nav.Element type="element">Land</Nav.Element>
          <Nav.Normaltekst>Tyskland</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="6" md="3">
          <Nav.Element type="element">Søker er</Nav.Element>
          <Nav.Normaltekst>Arbeidstaker</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="6" md="3">
          <Nav.Element type="element">Navn på arbeidsgiver</Nav.Element>
          <Nav.Normaltekst>Multiconsult ASA</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Nav.Knapp type="hoved" onClick={() => props.fattVedtakHandler()}>Fatt vedtak</Nav.Knapp>
        </Nav.Column>
        <Nav.Column xs="6" className="fane__fot">
          <a href="http://localhost">Forhåndsvis vedtaksbrev</a>
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  </div>
);

Vedtak.propTypes = {
  fattVedtakHandler: PT.func.isRequired,
};

export default Vedtak;
