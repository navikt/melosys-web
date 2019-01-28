import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './henlagtInformasjon.css';

const HenlagtInformasjon = props => {
  const { begrunnelse, fritekst } = props;
  const henlagtTekst = (fritekst !== undefined) ? fritekst : begrunnelse;

  return (
    <section aria-label="henlagtStatus" className="henlagtStatus panelSeksjon stegErstatter">
      <Nav.Panel>
        <Nav.Row>
          <Nav.Systemtittel>Saken er henlagt:</Nav.Systemtittel>
        </Nav.Row>
        <p> { henlagtTekst } </p>
      </Nav.Panel>
    </section>
  );
};

HenlagtInformasjon.propTypes = {
  begrunnelse: PT.object.isRequired,
  fritekst: PT.object.isRequired,
};


export default HenlagtInformasjon;
