import React, { Fragment, useState } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../ui';

import './vurderingGodkjennUtpekingAnnetLand.css';

const VurderingGodkjennUtpekingAnnetLand = ({
  lagreOgGodkjennUnntaksperioder,
  redigerbart,
  overskrift,
}) => {
  const [varsleUtland, setVarsleUtland] = useState(false);

  const vedEndring = event => {
    setVarsleUtland(event.target.checked);
  };

  const hovedknappHandler = () => {
    lagreOgGodkjennUnntaksperioder({
      varsleUtland,
    });
  };

  return (
    <Fragment>
      <Nav.typo.Undertittel>{overskrift}</Nav.typo.Undertittel>
      {
        redigerbart &&
        <Nav.Row className="sendA012">
          <Nav.Column xs="12">
            <Nav.Checkbox
              label="Send A012"
              onChange={vedEndring}
            />
          </Nav.Column>
        </Nav.Row>
      }
      <Nav.Row>
        <Nav.Column xs="6" className="fane__fot">
          <Mui.Knapp type="hoved" disabled={!redigerbart} onClick={hovedknappHandler}>Bekreft</Mui.Knapp>
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingGodkjennUtpekingAnnetLand.propTypes = {
  lagreOgGodkjennUnntaksperioder: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  overskrift: PT.string.isRequired,
};

export default VurderingGodkjennUtpekingAnnetLand;
