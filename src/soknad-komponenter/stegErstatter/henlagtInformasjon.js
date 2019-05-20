import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as MKV from 'melosys-kodeverk';
import * as KV from '../../kodeverk';

import './henlagtInformasjon.css';

const HenlagtInformasjon = ({ begrunnelser, begrunnelseFritekst }) => {
  const begrunnelseBeskrivelse = !begrunnelser || begrunnelser.length === 0 ? 'Ukjent grunn'
    : KV.kodeTilTerm(begrunnelser[0], MKV.KTObjects.henleggelsesgrunner);
  const henlagtTekst = (begrunnelseFritekst && begrunnelseFritekst.length > 1) ? begrunnelseFritekst : begrunnelseBeskrivelse;


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
  begrunnelser:  PT.array.isRequired,
  begrunnelseFritekst: PT.string,
};

HenlagtInformasjon.defaultProps = {
  begrunnelser: [],
  begrunnelseFritekst: ''
};

export default HenlagtInformasjon;
