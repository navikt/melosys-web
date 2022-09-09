import React from "react";
import * as Nav from "../../navFrontend";
import "./alertmeldinger.css";

export const VirksomhetMelding = () => (
  <Nav.AlertStripeInfo className="virksomhetMelding">Behandlingen er journalført på virksomhet</Nav.AlertStripeInfo>
);

export const TomFlytMelding = () => (
  <Nav.AlertStripeAdvarsel className="tomFlytMelding">
    <b>Det finnes ikke en stegvelger for behandlingstemaet du har valgt, men:</b>
    <ul>
      <li>
        du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak og &quot;Opprett ny BUC&quot;-fanen for å
        sende SED
      </li>
      <li>du kan avslutte saken og angi resultatet i behandlingsmenyen</li>
    </ul>
  </Nav.AlertStripeAdvarsel>
);
