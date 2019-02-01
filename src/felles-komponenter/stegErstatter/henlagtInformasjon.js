import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

import './henlagtInformasjon.css';

const HenlagtInformasjon = ({ begrunnelse, fritekst }) => {
  const begrunnelseBeskrivelse = begrunnelse ? begrunnelse.term : 'Ukjent grunn';
  const henlagtTekst = (fritekst && fritekst.length > 1) ? fritekst : begrunnelseBeskrivelse;

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
  begrunnelse: MPT.Kodeverk.isRequired,
  fritekst: PT.string,
};

HenlagtInformasjon.defaultProps = {
  fritekst: '',
};

export default HenlagtInformasjon;
