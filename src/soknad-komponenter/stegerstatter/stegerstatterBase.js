import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './stegerstatterBase.css';

const StegerstatterBase = ({ tittel, beskrivelse }) => {
  return (
    <section aria-label="henlagtStatus" className="henlagtStatus panelSeksjon stegerstatter">
      <Nav.Panel>
        <Nav.Row>
          <Nav.Systemtittel>{tittel}</Nav.Systemtittel>
        </Nav.Row>
        <p>{ beskrivelse }</p>
      </Nav.Panel>
    </section>
  );
};

StegerstatterBase.propTypes = {
  tittel: PT.string.isRequired,
  beskrivelse: PT.string.isRequired,
}

export default StegerstatterBase;
