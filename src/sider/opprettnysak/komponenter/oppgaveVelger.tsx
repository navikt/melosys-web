import React, { useEffect } from "react";
import classNames from "classnames";

import MKV from "../../../melosyskodeverk";
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
  nyOpprettSakToggleEnabled: boolean;
  formValues: OpprettNySakFormData;
}

export const OppgaveVelger = ({
  oppgaverForsoktHentet,
  formValues: { hovedpart, saksnummer, oppretterOppgave },
  oppgaver,
  change,
  nyOpprettSakToggleEnabled,
}: OppgaveVelgerProps) => {
  const hovedpartErBruker = hovedpart === MKV.Koder.aktoersroller.BRUKER;
  const oppgaverFinnes = oppgaver.length > 0;

  useEffect(() => {
    change("oppretterOppgave", nyOpprettSakToggleEnabled);
  }, [nyOpprettSakToggleEnabled]);

  const settJournalpostID = (oppgaveID: string) => {
    const oppgave = oppgaver.find((o) => o.oppgaveID === oppgaveID);
    change("journalpostID", oppgave?.journalpostID);
  };

  if (saksnummer !== "-1" && nyOpprettSakToggleEnabled) {
    return (
      <div className="oppgaveVelger">
        <Nav.AlertStripeInfo>
          Når det opprettes en ny behandling på en eksisterende sak opprettes det en ny oppgave
        </Nav.AlertStripeInfo>
        <OpprettNyOppgave />
      </div>
    );
  }

  if (!oppgaverFinnes && oppgaverForsoktHentet && nyOpprettSakToggleEnabled) {
    return (
      <div className="oppgaveVelger">
        <Nav.AlertStripeInfo>Ingen eksisterende oppgaver funnet. Det blir opprettet en ny</Nav.AlertStripeInfo>
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

  const oppgaverIkkeHentetMelding = hovedpartErBruker
    ? "Skriv inn brukers f.nr eller d.nr for å hente oppgaver."
    : "Skriv inn virksomhetens organisasjonsnummer for å hente oppgaver.";

  const ingenOppgaverMelding = `Det finnes ingen oppgaver på denne ${
    hovedpartErBruker ? "personen" : "organisasjonen"
  }.`;

  return (
    <div className="oppgaveVelger">
      {nyOpprettSakToggleEnabled && (
        <div className="velgVisning">
          <Skjema.Radio
            feltNavn="oppretterOppgave"
            label="Opprett ny oppgave"
            className={classNames("visningValg", { "checked-valg": oppretterOppgave })}
            name="velgVisningOppgave"
            value
          />
          <Skjema.Radio
            feltNavn="oppretterOppgave"
            label="Eksisterende oppgave"
            className={classNames("visningValg", { "checked-valg": !oppretterOppgave })}
            name="velgVisningOppgave"
            value={false}
          />
        </div>
      )}
      {oppretterOppgave ? (
        <OpprettNyOppgave />
      ) : (
        <>
          {oppgaverFinnes && (
            <>
              {nyOpprettSakToggleEnabled && (
                <Nav.AlertStripeInfo className="marginMellomHeaderOgAlertStripe">
                  Det er kun følgende oppgaver med journalpost-id som kan tilknyttes
                </Nav.AlertStripeInfo>
              )}
              <Skjema.CustomRadioPanelGruppe feltNavn="oppgaveID" radios={radioValg} notify={settJournalpostID} />
            </>
          )}
          {!oppgaverFinnes && !oppgaverForsoktHentet && !nyOpprettSakToggleEnabled && (
            <Nav.AlertStripeInfo>{oppgaverIkkeHentetMelding}</Nav.AlertStripeInfo>
          )}
          {!oppgaverFinnes && oppgaverForsoktHentet && !nyOpprettSakToggleEnabled && (
            <Nav.AlertStripeAdvarsel>{ingenOppgaverMelding}</Nav.AlertStripeAdvarsel>
          )}
        </>
      )}
    </div>
  );
};
