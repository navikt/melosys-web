import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "../../../hooks";
import { RootState } from "AppTypes";

import * as Nav from "../../../navFrontend";
import * as Api from "../../../services/api";
import { isApiError } from "../../../services/sjekkStatuskode";
import { behandlingerOperations, behandlingerSelectors } from "../../../ducks/behandlinger";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_TILDEL_OPPGAVE } from "../../../featuretoggle/toggleNavn";

import Handling from "./handling";

const STANDARD_FEILMELDING = "Kunne ikke tildele oppgaven. Prøv igjen, eller oppdater siden.";
const OPPFRISKNING_FEILET = "Oppgaven ble tildelt, men siden kunne ikke oppdateres. Oppdater siden og prøv igjen.";

const DIALOGTITTEL = "Legg behandlingen i mine oppgaver";

function TildelOppgave() {
  const dispatch = useDispatch();
  const toggleEnabled = useFeatureToggle(MELOSYS_TILDEL_OPPGAVE);

  const behandlingID = useSelector((state: RootState) => behandlingerSelectors.BehandlingIDSelector(state));
  const tilordnetIdent = useSelector((state: RootState) => behandlingerSelectors.TilordnetIdentSelector(state));
  const tilordnetNavn = useSelector((state: RootState) => behandlingerSelectors.TilordnetNavnSelector(state));
  const tilordnetMeg = useSelector((state: RootState) => behandlingerSelectors.TilordnetMegSelector(state));
  const kanTildeles = useSelector((state: RootState) => behandlingerSelectors.KanTildelesSelector(state));

  const tildelingTilgjengelig = useSelector((state: RootState) =>
    behandlingerSelectors.TildelingTilgjengeligSelector(state),
  );

  const [visBekreftelse, setVisBekreftelse] = useState(false);
  const [lagrer, setLagrer] = useState(false);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  if (!toggleEnabled || !tildelingTilgjengelig || (!kanTildeles && !tilordnetMeg)) return null;

  const erTildeltAnnen = Boolean(tilordnetNavn) && !tilordnetMeg;

  const lukk = () => {
    setVisBekreftelse(false);
    setFeilmelding(null);
  };

  const tildel = async () => {
    setLagrer(true);
    setFeilmelding(null);
    let tildelingFullført = false;
    try {
      await Api.Oppgaver.tildel({ behandlingID, forventetTilordnetIdent: tilordnetIdent });
      tildelingFullført = true;
      await dispatch(behandlingerOperations.oppfriskBehandling());
      setVisBekreftelse(false);
    } catch (error) {
      // sjekkStatuskode kaster SyntaxError i stedet for ApiError når svaret ikke er JSON,
      // for eksempel 502 med HTML fra en proxy. Da er error.message uegnet å vise.
      const melding = isApiError(error) ? error.body?.message : undefined;
      setFeilmelding(
        tildelingFullført
          ? OPPFRISKNING_FEILET
          : typeof melding === "string" && melding.trim()
            ? melding
            : STANDARD_FEILMELDING,
      );

      if (!tildelingFullført) {
        // Slo tildelingen feil fordi noen andre rakk den først, er tilordnetIdent utdatert.
        // Uten oppfriskning sender neste forsøk samme verdi og feiler likt om igjen.
        try {
          await dispatch(behandlingerOperations.oppfriskBehandling());
        } catch {
          // Feilmeldingen over står uansett; brukeren kan oppdatere siden selv.
        }
      }
    } finally {
      setLagrer(false);
    }
  };

  return (
    <>
      <Handling
        tekst="Til min oppgaveliste"
        onClick={() => setVisBekreftelse(true)}
        disabled={tilordnetMeg || !kanTildeles}
      />

      {visBekreftelse && (
        <Nav.Modal
          open
          // Lukking må stoppes mens kallet pågår, ellers settes feilmeldingen på en lukket
          // dialog og brukeren får aldri vite om overtakelsen gikk gjennom. Det er
          // onBeforeClose som avgjør: onClose er den native close-eventen på <dialog>, og
          // fyrer først etter at dialogen er lukket.
          onBeforeClose={() => !lagrer}
          onClose={lukk}
          aria-label="Bekreft tildeling av oppgave"
          width="small"
        >
          <Nav.Modal.Header>
            <Nav.Heading size="small" level="1">
              {DIALOGTITTEL}?
            </Nav.Heading>
          </Nav.Modal.Header>
          <Nav.Modal.Body>
            {erTildeltAnnen ? (
              <Nav.Alert variant="warning" size="small">
                Behandlingen er allerede tildelt <strong>{tilordnetNavn}</strong>. Hvis du overtar behandlingen, mister{" "}
                {tilordnetNavn} tilgangen til å redigere saken.
              </Nav.Alert>
            ) : (
              <Nav.BodyLong>Behandlingen er ikke tildelt noen, og blir lagt i dine oppgaver.</Nav.BodyLong>
            )}
            {feilmelding && (
              <Nav.Alert variant="error" size="small" style={{ marginTop: "0.75rem" }}>
                {feilmelding}
              </Nav.Alert>
            )}
          </Nav.Modal.Body>
          <Nav.Modal.Footer>
            <Nav.Button variant="primary" onClick={tildel} loading={lagrer}>
              {erTildeltAnnen ? "Overta behandlingen" : "Ja, legg i mine oppgaver"}
            </Nav.Button>
            <Nav.Button variant="tertiary" onClick={lukk} disabled={lagrer}>
              Avbryt
            </Nav.Button>
          </Nav.Modal.Footer>
        </Nav.Modal>
      )}
    </>
  );
}

export default TildelOppgave;
