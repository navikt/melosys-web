import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import { OpprettNySakFormData } from "../opprettnysak";
import { OpprettNyOppgave } from "./opprettNyOppgave";

import "./oppgaveVelger.css";
import { HStack } from "@navikt/ds-react";
import { EnkelNavBox } from "../../../felleskomponenter/enkelNavBox";

interface OppgaveVelgerProps {
  formValues: OpprettNySakFormData;
}

export function OppgaveVelger({ formValues: { saksnummer, oppretterOppgave } }: OppgaveVelgerProps) {
  if (saksnummer !== "-1") {
    return (
      <div className="oppgaveVelger">
        <Nav.Alert variant="info">
          Når det opprettes en ny behandling på en eksisterende sak opprettes det en ny oppgave
        </Nav.Alert>
        <OpprettNyOppgave />
      </div>
    );
  }

  return (
    <div className="oppgaveVelger">
      <Skjema.RadioGroup legend="" hideLegend name="oppretterOppgave" size="medium">
        <HStack gap="3" justify="space-between">
          <EnkelNavBox focused={oppretterOppgave}>
            <Nav.Radio value>Opprett ny oppgave</Nav.Radio>
          </EnkelNavBox>
        </HStack>
      </Skjema.RadioGroup>
      {oppretterOppgave && <OpprettNyOppgave />}
    </div>
  );
}
