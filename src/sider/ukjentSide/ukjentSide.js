import PT from 'prop-types';
import React from 'react';

import * as Nav from '../../utils/navFrontend';

import './ukjentSide.css';

/* eslint arrow-body-style:off */
const UkjentSide = ({ location }) => {
  const logdata = {
    message: 'Ukjent Side',
    data: {
      url: location.pathname,
    },
  };
  window.frontendlogger.error(logdata);
  return (
    <Nav.AlertStripe type="feil" className="ukjentSide">
      <Nav.typo.Systemtittel>Denne siden finnes ikke: &quot;{location.pathname}&quot;.</Nav.typo.Systemtittel>
      <p>Dersom du ble sendt hit fra Gosys eller et annet Nav-system, ta kontakt med driftsansvarlig.</p>
      <Nav.Lenker href="/" ariaLabel="Navigasjonslink tilbake til forsiden">
        Klikk her for å gå tilbake til forsiden
      </Nav.Lenker>
    </Nav.AlertStripe>
  );
};

UkjentSide.propTypes = {
  location: PT.object.isRequired,
};

export default UkjentSide;
