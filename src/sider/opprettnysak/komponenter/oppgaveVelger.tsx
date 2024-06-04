import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";

import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import { OpprettNySakFormData } from "../opprettnysak";
import { OpprettNyOppgave } from "./opprettNyOppgave";

import "./oppgaveVelger.css";

interface OppgaveVelgerProps {
  oppgaverForsoktHentet: boolean;
  oppgaver: Api.Oppgaver.SokOppgaveResDto[];
  change: (field: string, value: any) => void;
  formValues: OpprettNySakFormData;
}

export const OppgaveVelger = ({
  oppgaverForsoktHentet,
  formValues: { saksnummer, oppretterOppgave },
  oppgaver,
  change,
}: OppgaveVelgerProps) => {
  const oppgaverFinnes = oppgaver.length > 0;

  const settJournalpostID = (oppgaveID: string) => {
    const oppgave = oppgaver.find((o) => o.oppgaveID === oppgaveID);
    change("journalpostID", oppgave?.journalpostID);
  };

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

  if (!oppgaverFinnes && oppgaverForsoktHentet) {
    return (
      <div className="oppgaveVelger">
        <Nav.Alert variant="info">Ingen eksisterende oppgaver funnet. Det blir opprettet en ny</Nav.Alert>
        <OpprettNyOppgave />
      </div>
    );
  }

  const radioValg = oppgaver.map((oppgave) => {
    const tema = KV.Koder.Tema[oppgave.tema];
    const innhold = (
      <Skjema.CustomRadioPanelElement
        tittel={tema}
        data={[
          { term: "Oppgavetype:", description: oppgave.oppgavetype },
          { term: "Registrert dato:", description: <EnkeltDato dato={oppgave.registrertDato} /> },
          { term: "Saksid:", description: oppgave.sakID },
          { term: "Frist:", description: <EnkeltDato dato={oppgave.frist} /> },
        ]}
      />
    );

    return {
      value: oppgave.oppgaveID,
      innhold,
    };
  });

  return (
    <div className="oppgaveVelger">
      <Skjema.RadioGroup legend="" hideLegend name="oppretterOppgave" size="medium">
        <Nav.Radio value>Opprett ny oppgave</Nav.Radio>
        <Nav.Radio value={false}>Eksisterende oppgave</Nav.Radio>
      </Skjema.RadioGroup>
      {oppretterOppgave ? (
        <OpprettNyOppgave />
      ) : (
        <>
          {oppgaverFinnes && (
            <>
              <Nav.Alert className="alertstripe" variant="info">
                Du kan kun velge mellom følgende oppgaver som er knyttet til et inngående dokument
              </Nav.Alert>
              <Skjema.CustomRadioPanelGruppe feltNavn="oppgaveID" radios={radioValg} notify={settJournalpostID} />
            </>
          )}
        </>
      )}
    </div>
  );
};
