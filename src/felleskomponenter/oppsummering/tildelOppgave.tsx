import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import { isApiError } from "../../services/sjekkStatuskode";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { useFeatureToggle } from "../../featuretoggle";
import { MELOSYS_TILDEL_OPPGAVE } from "../../featuretoggle/toggleNavn";
import OppsummeringVerdiPar from "./verdiPar/oppsummeringVerdiPar";

import "./tildelOppgave.less";

const STANDARD_FEILMELDING = "Kunne ikke tildele oppgaven. Prøv igjen, eller oppdater siden.";

const KNAPPETEKST = "Legg behandlingen i mine oppgaver";

function TildelOppgave() {
  const dispatch = useDispatch();
  const toggleEnabled = useFeatureToggle(MELOSYS_TILDEL_OPPGAVE);

  const behandlingID = useSelector((state: RootState) => behandlingerSelectors.BehandlingIDSelector(state));
  const tilordnetNavn = useSelector((state: RootState) => behandlingerSelectors.TilordnetNavnSelector(state));
  const tilordnetMeg = useSelector((state: RootState) => behandlingerSelectors.TilordnetMegSelector(state));
  const kanTildeles = useSelector((state: RootState) => behandlingerSelectors.KanTildelesSelector(state));

  const tildelingTilgjengelig = useSelector((state: RootState) =>
    behandlingerSelectors.TildelingTilgjengeligSelector(state),
  );

  const [visBekreftelse, setVisBekreftelse] = useState(false);
  const [lagrer, setLagrer] = useState(false);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  if (!toggleEnabled) return null;

  const erTildeltAnnen = Boolean(tilordnetNavn) && !tilordnetMeg;
  const visningsnavn = tildelingTilgjengelig ? (tilordnetNavn ?? "Ikke tildelt") : "Tildeling utilgjengelig";

  const lukk = () => {
    setVisBekreftelse(false);
    setFeilmelding(null);
  };

  const tildel = async () => {
    setLagrer(true);
    setFeilmelding(null);
    try {
      await Api.Oppgaver.tildel({ behandlingID });
      dispatch(behandlingerOperations.oppdaterBehandling() as never);
      setVisBekreftelse(false);
    } catch (error) {
      const melding = error instanceof Error ? (isApiError(error) ? error.body?.message : error.message) : undefined;
      setFeilmelding(typeof melding === "string" && melding.trim() ? melding : STANDARD_FEILMELDING);
    } finally {
      setLagrer(false);
    }
  };

  return (
    <div className="tildel-oppgave">
      <OppsummeringVerdiPar nokkel="Saksbehandler" verdi={visningsnavn} />

      {tildelingTilgjengelig && kanTildeles && (
        <Nav.Button variant="secondary" size="small" onClick={() => setVisBekreftelse(true)}>
          {KNAPPETEKST}
        </Nav.Button>
      )}

      {visBekreftelse && (
        <Nav.Modal open onClose={lukk} aria-label="Bekreft tildeling av oppgave" width="small">
          <Nav.Modal.Header>
            <Nav.Heading size="small" level="1">
              {KNAPPETEKST}?
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
    </div>
  );
}

export default TildelOppgave;
