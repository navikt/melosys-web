import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './inntekt.css';

const uuid = require('uuid/v4');


function Inntekt ({ inntekt }) {

  return (
    <div className="inntekt panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Inntekt i Norge">
        <Nav.Container fluid>
          inntekten
        </Nav.Container>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Inntekt.propTypes = {
  inntekt: MPT.Inntekt,
};

Inntekt.defaultProps = {
  inntekt: {},
};

export default Inntekt;
