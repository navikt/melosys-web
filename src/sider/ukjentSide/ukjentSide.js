import PT from "prop-types";
import React from "react";

import * as Nav from "../../navFrontend";

import "./ukjentSide.css";

/* eslint arrow-body-style:off */
const UkjentSide = ({ location }) => {
  const logdata = {
    message: "Ukjent Side",
    data: {
      url: location.pathname,
    },
  };
  // eslint-disable-next-line no-console
  console.error(logdata);
  return (
    <Nav.AlertStripe type="feil" className="ukjentSide">
      <Nav.Typo.Systemtittel>Denne siden finnes ikke: &quot;{location.pathname}&quot;.</Nav.Typo.Systemtittel>
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
