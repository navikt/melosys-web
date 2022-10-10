import React, { useEffect, useState } from "react";
import classNames from "classnames";
import EnkeltDato from "../../../felleskomponenter/enkeltDato";
import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import MKV from "../../../melosyskodeverk";

import * as Skjema from "../../../felleskomponenter/skjema";
import { useFeatureToggle } from "../../../featuretoggle";

import "./oppgaveVelger.css";

const EKSISTERENDE = "Eksisterende oppgave";
const OPPRETT = "Opprett ny oppgave";

interface OppgaveVelgerProps {
  oppgaverForsoktHentet: boolean;
  hovedpart: string;
  oppgaver: Api.Oppgaver.SokOppgaveResDto[];
  lagNyOppgave: boolean;
  nullstillFormverdier: () => void;
  change: (field: string, value: any) => void;
}

export const OppgaveVelger = ({
  oppgaverForsoktHentet,
  hovedpart,
  oppgaver,
  change,
  lagNyOppgave,
  nullstillFormverdier,
}: OppgaveVelgerProps) => {
  const nyOpprettSakToggle = useFeatureToggle("melosys.ny_opprett_sak");
  const [valgtVisning, setValgtVisning] = useState(lagNyOppgave ? OPPRETT : EKSISTERENDE);

  const hovedpartErBruker = hovedpart === MKV.Koder.aktoersroller.BRUKER;
  const oppgaverFinnes = oppgaver.length > 0;

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

  useEffect(() => {
    if (nyOpprettSakToggle === "enabled") {
      setValgtVisning(OPPRETT);
    } else {
      setValgtVisning(EKSISTERENDE);
    }
  }, [nyOpprettSakToggle]);

  const settJournalpostID = (oppgaveID: string) => {
    const oppgave = oppgaver.find((o) => o.oppgaveID === oppgaveID);
    change("journalpostID", oppgave?.journalpostID);
  };
  return (
    <>
      {nyOpprettSakToggle === "enabled" && lagNyOppgave && oppgaverFinnes ? (
        <div className="oppgaveVelger">
          <div className="velgVisning">
            <Nav.Radio
              label={OPPRETT}
              className={classNames("visningValg", { "checked-valg": valgtVisning === OPPRETT })}
              name="velgVisningOppgave"
              onChange={() => {
                setValgtVisning(OPPRETT);
                nullstillFormverdier();
              }}
              checked={valgtVisning === OPPRETT}
              value={OPPRETT}
            />
            <Nav.Radio
              label={EKSISTERENDE}
              className={classNames("visningValg", { "checked-valg": valgtVisning === EKSISTERENDE })}
              name="velgVisningOppgave"
              onChange={() => {
                setValgtVisning(EKSISTERENDE);
                nullstillFormverdier();
              }}
              checked={valgtVisning === EKSISTERENDE}
              value={EKSISTERENDE}
            />
          </div>
        </div>
      ) : (
        valgtVisning === OPPRETT && (
          <Nav.AlertStripeInfo>
            Når det opprettes en ny behandling på en eksisterende sak, må det opprettes en ny oppgave
          </Nav.AlertStripeInfo>
        )
      )}
      {valgtVisning === EKSISTERENDE ? (
        <>
          {oppgaverFinnes && (
            <div className="marginMellomCustomRadioPaneler">
              {nyOpprettSakToggle === "enabled" && (
                <Nav.AlertStripeInfo className="marginMellomHeaderOgAlertStripe">
                  Det er kun følgende oppgaver med journalpost-id som kan tilknyttes
                </Nav.AlertStripeInfo>
              )}
              <Skjema.CustomRadioPanelGruppe feltNavn="oppgaveID" radios={radioValg} notify={settJournalpostID} />
            </div>
          )}
          {!oppgaverFinnes && !oppgaverForsoktHentet && (
            <Nav.AlertStripeInfo>
              {hovedpartErBruker
                ? "Skriv inn brukers f.nr eller d.nr for å hente oppgaver."
                : "Skriv inn virksomhetens organisasjonsnummer for å hente oppgaver."}
            </Nav.AlertStripeInfo>
          )}
          {!oppgaverFinnes && oppgaverForsoktHentet && (
            <Nav.AlertStripeAdvarsel>
              {nyOpprettSakToggle === "enabled"
                ? "Ingen eksisterende oppgaver funnet. Det blir opprettet en ny"
                : `Det finnes ingen oppgaver på denne ${hovedpartErBruker ? "personen" : "organisasjonen"}.`}
            </Nav.AlertStripeAdvarsel>
          )}
        </>
      ) : null}
    </>
  );
};
