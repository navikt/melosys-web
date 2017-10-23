import React from 'react';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';

import './arbeidsforhold.css';

const uuid = require('uuid/v4');

function Arbeidsforhold({ arbeidsforhold }) {
  console.log(arbeidsforhold);
  return (
    <div className="arbeidsforhold panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Arbeidsforhold" apen>
        <div>somehting</div>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Arbeidsforhold.propTypes = {
  arbeidsforhold: PT.arrayOf(MPT.Arbeidsforhold.isRequired).isRequired,
};

export default Arbeidsforhold;
