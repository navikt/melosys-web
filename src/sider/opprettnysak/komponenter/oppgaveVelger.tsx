import React, { useEffect, useState } from "react";
import classNames from "classnames";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";

import { useFeatureToggle } from "../../../featuretoggle";
import EnkeltDato from "../../../felleskomponenter/enkeltDato";

import "./oppgaveVelger.css";

const EKSISTERENDE = "Eksisterende oppgave";
const OPPRETT = "Opprett ny oppgave";

interface OppgaveVelgerProps {
  oppgaverForsoktHentet: boolean;
  hovedpart: string;
  saksnummer: string;
  oppgaver: Api.Oppgaver.SokOppgaveResDto[];
  change: (field: string, value: any) => void;
}

export const OppgaveVelger = ({
  oppgaverForsoktHentet,
  hovedpart,
  saksnummer,
  oppgaver,
  change,
}: OppgaveVelgerProps) => {
  const nyOpprettSakToggle = useFeatureToggle("melosys.ny_opprett_sak");
  const [valgtVisning, setValgtVisning] = useState(OPPRETT);
  const hovedpartErBruker = hovedpart === MKV.Koder.aktoersroller.BRUKER;
  const oppgaverFinnes = oppgaver.length > 0;

  useEffect(() => {
    if (nyOpprettSakToggle === "enabled") {
      setValgtVisning(OPPRETT);
    } else {
      setValgtVisning(EKSISTERENDE);
    }
  }, [nyOpprettSakToggle]);

  const radioValg = oppgaver
    .filter((oppgave) => oppgave.journalpostID)
    .map((oppgave) => {
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

  const settJournalpostID = (oppgaveID: string) => {
    const oppgave = oppgaver.find((o) => o.oppgaveID === oppgaveID);
    change("journalpostID", oppgave?.journalpostID);
  };

  if (saksnummer !== "-1" && nyOpprettSakToggle === "enabled") {
    return (
      <div className="oppgaveVelger">
        <Nav.AlertStripeInfo>
          Når det opprettes en ny behandling på en eksisterende sak, må det opprettes en ny oppgave
        </Nav.AlertStripeInfo>
      </div>
    );
  }

  const oppgaverIkkeHentetMelding = hovedpartErBruker
    ? "Skriv inn brukers f.nr eller d.nr for å hente oppgaver."
    : "Skriv inn virksomhetens organisasjonsnummer for å hente oppgaver.";

  const ingenOppgaverMelding =
    nyOpprettSakToggle === "enabled"
      ? "Ingen eksisterende oppgaver funnet. Det blir opprettet en ny"
      : `Det finnes ingen oppgaver på denne ${hovedpartErBruker ? "personen" : "organisasjonen"}.`;

  return (
    <div className="oppgaveVelger">
      {nyOpprettSakToggle === "enabled" && (
        <div className="velgVisning">
          <Nav.Radio
            label={OPPRETT}
            className={classNames("visningValg", { "checked-valg": valgtVisning === OPPRETT })}
            name="velgVisningOppgave"
            onChange={() => {
              setValgtVisning(OPPRETT);
              change("oppgaveID", null);
            }}
            checked={valgtVisning === OPPRETT}
            value={OPPRETT}
          />
          <Nav.Radio
            label={EKSISTERENDE}
            className={classNames("visningValg", { "checked-valg": valgtVisning === EKSISTERENDE })}
            name="velgVisningOppgave"
            onChange={() => setValgtVisning(EKSISTERENDE)}
            checked={valgtVisning === EKSISTERENDE}
            value={EKSISTERENDE}
          />
        </div>
      )}
      {valgtVisning === EKSISTERENDE ? (
        <>
          {oppgaverFinnes && (
            <>
              {nyOpprettSakToggle === "enabled" && (
                <Nav.AlertStripeInfo className="marginMellomHeaderOgAlertStripe">
                  Det er kun følgende oppgaver med journalpost-id som kan tilknyttes
                </Nav.AlertStripeInfo>
              )}
              <Skjema.CustomRadioPanelGruppe feltNavn="oppgaveID" radios={radioValg} notify={settJournalpostID} />
            </>
          )}
          {!oppgaverFinnes && !oppgaverForsoktHentet && nyOpprettSakToggle !== "enabled" && (
            <Nav.AlertStripeInfo>{oppgaverIkkeHentetMelding}</Nav.AlertStripeInfo>
          )}
          {!oppgaverFinnes && oppgaverForsoktHentet && (
            <Nav.AlertStripeAdvarsel>{ingenOppgaverMelding}</Nav.AlertStripeAdvarsel>
          )}
        </>
      ) : null}
    </div>
  );
};
