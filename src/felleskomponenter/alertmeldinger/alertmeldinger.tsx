import { useEffect, useState } from "react";

import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";

import "./alertmeldinger.less";

export function Innsynsmelding({ className = "" }) {
  return (
    <Nav.Alert variant="info" className={`innsynsmelding ${className}`}>
      Innsynsmodus
    </Nav.Alert>
  );
}

export function VirksomhetMelding() {
  return (
    <Nav.Alert variant="info" className="virksomhetMelding">
      Behandlingen er journalført på virksomhet
    </Nav.Alert>
  );
}

export function IngenFlytÅrsavregningMelding() {
  return (
    <Nav.Alert variant="warning" className="ingenFlytMelding">
      <b>Du kan ikke årsavregne disse type saker i Melosys enda, vi jobber med å få det på plass</b>
    </Nav.Alert>
  );
}

export function IngenFlytMelding() {
  return (
    <Nav.Alert variant="warning" className="ingenFlytMelding">
      <b>Du kan ikke gå videre, men:</b>
      <ul className="listePadding">
        <li>
          du kan bruke &quot;Send brev&quot;-fanen for å sende brev og vedtak, og &quot;Opprett ny BUC&quot;-fanen for å
          sende SED
        </li>
        <li>du må avslutte behandlingen og angi resultatet i behandlingsmenyen</li>
        <li>periode i MEDL og eventuelt avgiftssystemet må registreres manuelt</li>
      </ul>
    </Nav.Alert>
  );
}

export function NyVurderingMelding() {
  return (
    <Nav.Alert variant="warning" className="nyVurderingMelding">
      <Nav.Heading size="small">Ny behandling av sak</Nav.Heading>
      <Nav.BodyLong size="small">
        Du har startet en ny behandling av en sak der tidligere behandling er avsluttet. Sjekk sakens opplysninger og
        vurder videre behandling.
      </Nav.BodyLong>
    </Nav.Alert>
  );
}

interface StandardMeldingOverstProps {
  variant: "error" | "warning" | "info" | "success";
  actionEtterSynlighet: () => void;
  melding: string;
}

export function StandardMeldingOverst({ variant, actionEtterSynlighet, melding }: StandardMeldingOverstProps) {
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
      <Nav.Alert variant={variant}>
        {melding}
        <Ikoner.Remove onClick={() => actionsEtterSynlighet()} />
      </Nav.Alert>
    </div>
  ) : null;
}
