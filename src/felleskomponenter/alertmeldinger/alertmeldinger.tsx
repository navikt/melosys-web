import { AlertStripeType } from "nav-frontend-alertstriper";
import React, { ReactNode, useEffect, useState } from "react";
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

interface StandardMeldingOverstProps {
  type: AlertStripeType;
  actionEtterSynlighet: () => void;
  children: ReactNode;
}

export const StandardMeldingOverst = ({ type, actionEtterSynlighet, children }: StandardMeldingOverstProps) => {
  const [viserMelding, setViserMelding] = useState(false);
  const VARIGHET_MELDING = 3000;

  useEffect(() => {
    setViserMelding(true);
    const timer = setTimeout(() => {
      setViserMelding(false);
      actionEtterSynlighet();
    }, VARIGHET_MELDING);
    return () => clearTimeout(timer);
  }, []);

  return viserMelding ? (
    <div className="standardMeldingOverst">
      <Nav.AlertStripe type={type}>{children}</Nav.AlertStripe>
    </div>
  ) : null;
};
