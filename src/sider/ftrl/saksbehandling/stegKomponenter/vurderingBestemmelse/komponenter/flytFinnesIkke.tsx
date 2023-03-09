import React from "react";
import * as Nav from "../../../../../../navFrontend";

export const FlytFinnesIkke = () => (
  <Nav.AlertStripeAdvarsel>
    <Nav.Typo.Undertittel> Du kan ikke gå videre i stegvelgeren, men: </Nav.Typo.Undertittel>
    <ul>
      <li>du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak</li>
      <li>du kan avslutte saken og angi behandlingsresultatet i behandlingsmenyen</li>
    </ul>
  </Nav.AlertStripeAdvarsel>
);
