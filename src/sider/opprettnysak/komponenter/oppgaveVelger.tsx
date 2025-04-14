import * as Nav from "../../../navFrontend";
import { OpprettNySakFormData } from "../opprettnysak";
import { OpprettNyOppgave } from "./opprettNyOppgave";

import "./oppgaveVelger.css";

interface OppgaveVelgerProps {
  formValues: OpprettNySakFormData;
}

export function OppgaveVelger({ formValues: { saksnummer, oppretterOppgave } }: OppgaveVelgerProps) {
  if (saksnummer !== "-1") {
    return (
      <div className="oppgaveVelger">
        <OpprettNyOppgave />
      </div>
    );
  }

  return <div className="oppgaveVelger">{oppretterOppgave && <OpprettNyOppgave />}</div>;
}
