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
const DatoOmrade = ({ periode, label }) => (
  <Fragment>
    {
      label &&
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Element>{label}</Nav.Element>
        </Nav.Column>
      </Nav.Row>
    }
    <Nav.Row>
      <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Fra</Nav.Element><EnkeltDato dato={periode.fom} /></Nav.Column>
      <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Til</Nav.Element><EnkeltDato dato={periode.tom} /></Nav.Column>
    </Nav.Row>
  </Fragment>
);

DatoOmrade.propTypes = {
  periode: MPT.Periode.isRequired,
  label: PT.string,
};

DatoOmrade.defaultProps = {
  label: '',
};

export const DatoOmradeMedVarighet = ({ periode, label }) => {
  const varighet = Utils.dato.datoDiffMenneskelig(periode.fom, periode.tom);

  return (
    <div className="datoomradevarighet">
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Element>{label}</Nav.Element>
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
  label: PT.string,
};

DatoOmradeMedVarighet.defaultProps = {
  label: '',
};

export const DatoOmradeDescription = ({ periode, label }) => (
  periode ?
    <Fragment>
      <dt>{label}</dt>
      <dd><EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} /></dd>
    </Fragment>
    : null
);

DatoOmradeDescription.propTypes = {
  periode: MPT.Periode.isRequired,
  label: PT.string.isRequired,
};

export default DatoOmrade;
