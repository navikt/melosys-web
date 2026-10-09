import { useLocation } from "react-router";

import * as Nav from "../../navFrontend";

import "./ukjentSide.less";

/* eslint arrow-body-style:off */
function UkjentSide() {
  const location = useLocation();
  const logdata = {
    message: "Ukjent Side",
    data: {
      url: location.pathname,
    },
  };
  /* eslint-disable-next-line no-console */
  console.error(logdata);
  return (
    <Nav.Alert variant="error" className="ukjentSide">
      <Nav.Heading size="small">Denne siden finnes ikke: &quot;{location.pathname}&quot;.</Nav.Heading>
      <p>Dersom du ble sendt hit fra Gosys eller et annet Nav-system, ta kontakt med driftsansvarlig.</p>
      <Nav.Link href="/" ariaLabel="Navigasjonslink tilbake til forsiden">
        Klikk her for å gå tilbake til forsiden
      </Nav.Link>
    </Nav.Alert>
  );
}

export default UkjentSide;
