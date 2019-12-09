import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';

import './stegerstatterBase.css';

const StegerstatterBase = ({ tittel, beskrivelse }) => (
  <section className="panelSeksjon stegerstatter">
    <Nav.Panel>
      <Nav.Row>
        <Nav.typo.Systemtittel>{tittel}</Nav.typo.Systemtittel>
      </Nav.Row>
      <p>{ beskrivelse }</p>
    </Nav.Panel>
  </section>
);

StegerstatterBase.propTypes = {
  tittel: PT.string.isRequired,
  beskrivelse: PT.string.isRequired,
};

export default StegerstatterBase;
