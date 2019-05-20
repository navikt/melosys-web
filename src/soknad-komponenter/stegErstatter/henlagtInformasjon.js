import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';

import './henlagtInformasjon.css';

const HenlagtInformasjon = ({ begrunnelseKoder, begrunnelseFritekst }) => {
  const begrunnelseBeskrivelse = !begrunnelseKoder || begrunnelseKoder.length === 0 ? 'Ukjent grunn'
    : KV.kodeTilTerm(begrunnelseKoder[0], MKV.KTObjects.henleggelsesgrunner);
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
  begrunnelseKoder: PT.arrayOf(PT.string),
  begrunnelseFritekst: PT.string,
};

HenlagtInformasjon.defaultProps = {
  begrunnelseKoder: [],
  begrunnelseFritekst: '',
};

export default HenlagtInformasjon;
