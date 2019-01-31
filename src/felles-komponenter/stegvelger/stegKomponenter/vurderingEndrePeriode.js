import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import PdfLenkeListe from '../../pdfLenkeListe';
import * as Nav from '../../../utils/navFrontend';

import { fagsakSelectors } from '../../../ducks/fagsaker';

import * as MPT from '../../../proptypes';

import './vurderingEndrePeriode.css';

export const VurderingEndrePeriode = ({ startDato, sluttDato, antallMnd, oppsummering }) => {
  const dokumenter = [
    { navn: 'Forhåndsvis vedtaksbrev', type: 'INNVILGELSE_YRKESAKTIV', data: { mottaker: 'BRUKER' } },
    { navn: 'Forhåndsvis A1', type: 'ATTEST_A1', data: { mottaker: 'MYNDIGHET' } },
  ];

  const { behandlingID } = oppsummering;

  return (
    <div className="vurderingEndrePeriode">
      <Nav.Undertittel>Endre lovvalgsperiode</Nav.Undertittel>
      I hvilken periode fyller søkeren kriteriene for artikkel 12, nr. 1?
      <Nav.Element className="mindreTittel">Opprinnelig lovvalgsperiode</Nav.Element>
      <Nav.Row>
        <Nav.Column xs="2">
          <Nav.Normaltekst>Fra {startDato}</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Normaltekst>Til {sluttDato}</Nav.Normaltekst>
        </Nav.Column>
        <Nav.Column xs="2">
          <Nav.Normaltekst>{antallMnd} mnd.</Nav.Normaltekst>
        </Nav.Column>
      </Nav.Row>
      <Nav.Element className="mindreTittel">Ny lovvalgsperiode</Nav.Element>
      <Nav.Row>
        <Nav.Column xs="3">
          Startdato
        </Nav.Column>
        <Nav.Column xs="3">
          Sluttdato
        </Nav.Column>
      </Nav.Row>
      <PdfLenkeListe behandlingID={behandlingID} dokumenter={dokumenter} />
      <Nav.Hovedknapp>Endre periode</Nav.Hovedknapp>
    </div>
  );
};

VurderingEndrePeriode.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
};

const mapStateToProps = state => ({
  oppsummering: fagsakSelectors.OppsummeringSelector(state),
});

export default connect(mapStateToProps, null)(VurderingEndrePeriode);
