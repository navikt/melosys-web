import React from 'react';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes/';

import EnkeltDato from './enkeltDato';

/** Dato-område som viser fra- og til-dato.
 *
 * @param props.periode
 * @constructor
 */
const DatoOmrade = ({ periode }) => (
  <Nav.Row>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Fra</Nav.Element><EnkeltDato dato={periode.fom} /></Nav.Column>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Til</Nav.Element><EnkeltDato dato={periode.tom} /></Nav.Column>
  </Nav.Row>
);

DatoOmrade.propTypes = {
  periode: MPT.Periode.isRequired,
};

export default DatoOmrade;
