import React, { Fragment } from 'react';
import * as PT from 'prop-types';
import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';
import * as MPT from '../../proptypes';

import EnkeltDato from './enkeltDato';

import './datoOmrade.css';

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

export const DatoOmradeMedVarighet = ({ periode, tekst }) => {
  const varighet = Utils.dato.datoDiffMenneskelig(periode.fom, periode.tom);

  return (
    <div className="datoomradevarighet">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Element>{tekst}</Nav.Element>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="4"><Nav.Element tag="span">Fra </Nav.Element><EnkeltDato dato={periode.fom} /></Nav.Column>
        <Nav.Column xs="4"><Nav.Element tag="span">Til </Nav.Element><EnkeltDato dato={periode.tom} /></Nav.Column>
        <Nav.Column xs="4">{varighet}</Nav.Column>
      </Nav.Row>
    </div>
  );
};

DatoOmradeMedVarighet.propTypes = {
  periode: MPT.Periode.isRequired,
  tekst: PT.string,
};

DatoOmradeMedVarighet.defaultProps = {
  tekst: '',
};

export const DatoOmradeDescription = ({ periode, tekst }) => (
  periode ?
    <Fragment>
      <dt>{tekst}</dt>
      <dd><EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} /></dd>
    </Fragment>
    : null
);

DatoOmradeDescription.propTypes = {
  periode: MPT.Periode.isRequired,
  tekst: PT.string.isRequired,
};

export default DatoOmrade;
