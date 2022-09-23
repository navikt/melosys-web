import { AlertStripeType } from "nav-frontend-alertstriper";
import React, { useEffect, useState } from "react";
import * as Nav from "../../navFrontend";
import "./alertmeldinger.css";
import * as Ikoner from "../../resources/images";

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

interface StandardMeldingOverstProps {
  type: AlertStripeType;
  actionEtterSynlighet: () => void;
  melding: string;
}

export const StandardMeldingOverst = ({ type, actionEtterSynlighet, melding }: StandardMeldingOverstProps) => {
  const [viserMelding, setViserMelding] = useState(true);
  const VARIGHET_MELDING = 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      actionsEtterSynlighet();
    }, VARIGHET_MELDING);
    return () => clearTimeout(timer);
  }, []);

  const actionsEtterSynlighet = () => {
    if (viserMelding) {
      setViserMelding(false);
      actionEtterSynlighet();
    }
  };

  return viserMelding ? (
    <div className="standardMeldingOverst">
      <Nav.AlertStripe type={type}>
        <div className="fullBredde">
          {melding}
          <Ikoner.Remove onClick={() => actionsEtterSynlighet()} />
        </div>
      </Nav.AlertStripe>
    </div>
  ) : null;
};
