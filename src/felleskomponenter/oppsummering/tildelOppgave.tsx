import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../navFrontend";
import * as Api from "../../services/api";
import { behandlingerOperations, behandlingerSelectors } from "../../ducks/behandlinger";
import { useFeatureToggle } from "../../featuretoggle";
import { MELOSYS_TILDEL_OPPGAVE } from "../../featuretoggle/toggleNavn";

import "./tildelOppgave.less";

const KNAPPETEKST = "Legg oppgaven i min benk";

/**
 * Viser hvem behandlingsoppgaven er tildelt, og lar saksbehandleren ta den selv.
 *
 * Knappen vises bare når oppgaven ikke allerede er min. Er den tildelt en annen saksbehandler
 * er overtakelse tillatt, men bekreftelsesdialogen sier eksplisitt fra om hvem man overtar fra.
 */
function TildelOppgave() {
  const dispatch = useDispatch();
  const { accounts } = useMsal();
  const toggleEnabled = useFeatureToggle(MELOSYS_TILDEL_OPPGAVE);

  const behandlingID = useSelector((state: RootState) => behandlingerSelectors.BehandlingIDSelector(state));
  const tilordnetIdent = useSelector((state: RootState) => behandlingerSelectors.TilordnetIdentSelector(state));
  const tilordnetNavn = useSelector((state: RootState) => behandlingerSelectors.TilordnetNavnSelector(state));

  const [visBekreftelse, setVisBekreftelse] = useState(false);
  const [lagrer, setLagrer] = useState(false);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  if (!toggleEnabled) return null;

  const minIdent = (accounts?.[0]?.idTokenClaims as { NAVident?: string } | undefined)?.NAVident ?? null;
  const erTildeltMeg = Boolean(minIdent) && tilordnetIdent === minIdent;
  const erTildeltAnnen = Boolean(tilordnetIdent) && !erTildeltMeg;

  const visningsnavn = erTildeltMeg ? "Meg" : (tilordnetNavn ?? "Ikke tildelt");

  const lukk = () => {
    setVisBekreftelse(false);
    setFeilmelding(null);
  };

  const tildel = async () => {
    setLagrer(true);
    setFeilmelding(null);
    try {
      await Api.Oppgaver.tildel({ behandlingID });
      // Hent behandlingen på nytt slik at tilordning og redigerbart oppdateres i hele saksbildet.
      dispatch(behandlingerOperations.oppdaterBehandling() as never);
      setVisBekreftelse(false);
    } catch (error) {
      setFeilmelding(
        error instanceof Error && error.message
          ? error.message
          : "Kunne ikke tildele oppgaven. Prøv igjen, eller oppdater siden hvis noen andre nettopp tok den.",
      );
    } finally {
      setLagrer(false);
    }
  };

  return (
    <div className="tildel-oppgave">
      <dl className="tildel-oppgave__status">
        <dt className="nokkel">Saksbehandler:</dt>
        <dd>{visningsnavn}</dd>
      </dl>

      {!erTildeltMeg && (
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
                Oppgaven er allerede tildelt <strong>{tilordnetNavn}</strong>. Tar du den, mister {tilordnetNavn}{" "}
                tilgangen til å redigere saken.
              </Nav.Alert>
            ) : (
              <Nav.BodyLong>Oppgaven er ikke tildelt noen. Den blir lagt i din benk.</Nav.BodyLong>
            )}
            {feilmelding && (
              <Nav.Alert variant="error" size="small" style={{ marginTop: "0.75rem" }}>
                {feilmelding}
              </Nav.Alert>
            )}
          </Nav.Modal.Body>
          <Nav.Modal.Footer>
            <Nav.Button variant="primary" onClick={tildel} loading={lagrer}>
              {erTildeltAnnen ? "Overta oppgaven" : "Ja, legg i min benk"}
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
