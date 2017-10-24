import React from 'react';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

/** Dato-område som viser fra- og til-dato.
 *
 * @param props.periode
 * @constructor
 */
const DatoOmrade = ({ periode }) => (
  <Nav.Row>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Fra</Nav.Element>{periode.fom || '-'}</Nav.Column>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Til</Nav.Element>{periode.tom || '-'}</Nav.Column>
  </Nav.Row>
);

DatoOmrade.propTypes = {
  periode: MPT.Periode.isRequired,
};

export default DatoOmrade;
