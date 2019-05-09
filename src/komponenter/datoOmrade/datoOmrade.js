import React from 'react';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

import EnkeltDato from './enkeltDato';

/** Dato-område som viser fra- og til-dato.
 *
 * @param periode
 * @constructor
 */
const DatoOmrade = ({ periode }) => (
  <Nav.Row>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>F.o.m.</Nav.Element><EnkeltDato dato={periode.fom} /></Nav.Column>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>T.o.m.</Nav.Element><EnkeltDato dato={periode.tom} /></Nav.Column>
  </Nav.Row>
);

DatoOmrade.propTypes = {
  periode: MPT.Periode.isRequired,
};

export const DatoOmradeTekst = ({ periode }) => (
  periode ?
    <React.Fragment>
      <EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} />
    </React.Fragment>
    : '(ukjent)'
);

DatoOmradeTekst.propTypes = {
  periode: MPT.Periode.isRequired,
};

export default DatoOmrade;
