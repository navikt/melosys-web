import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../ui';

const VurderingTomtSteg = ({
  hovedknappHandler,
  redigerbart,
  overskrift,
}) => (
  <Fragment>
    <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
    <Nav.Row>
      <Nav.Column xs="6" className="fane__fot">
        <Mui.Knapp type="hoved" disabled={!redigerbart} onClick={hovedknappHandler}>Bekreft</Mui.Knapp>
      </Nav.Column>
    </Nav.Row>
  </Fragment>
);

VurderingTomtSteg.propTypes = {
  hovedknappHandler: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  overskrift: PT.string.isRequired,
};

export default VurderingTomtSteg;
