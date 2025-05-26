import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { withRouter } from "react-router-dom";
import PT from "prop-types";
import * as Nav from "../../navFrontend";

import { oversikt } from "../../ducks/oppgaver/operations";
import Saksplukker from "./komponenter/saksplukker";
import SokSkjema from "./komponenter/sokskjema";
import JournalforingOppgaver from "./komponenter/mineoppgaver/jornualforingoppgaver";
import BehandlingOppgaver from "./komponenter/mineoppgaver/behandlingOppgaver";

import "./forside.css";
import { featureToggleOperations } from "../../ducks/featuretoggle";
import ErrorBoundary from "../../felleskomponenter/errorBoundary";
import * as Ikoner from "../../resources/images";

function Forside(props) {
  const { tilOpprettNySak, children = null } = props;
  const data = useSelector((state) => state.oppgaver.data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(featureToggleOperations.hent());
    dispatch(oversikt());
  }, []);

  const oppgaverTotalt =
    (data.journalforing || data.saksbehandling) === undefined
      ? 0
      : data.journalforing.length + data.saksbehandling.length;

  return (
    <div className="forside">
      <div className="forside__header">
        <div>
          <Nav.Heading size="large">Mine oppgaver</Nav.Heading>
          <Nav.BodyLong size="small">{oppgaverTotalt} oppgaver</Nav.BodyLong>
        </div>
        <div>
          <Nav.Button onClick={tilOpprettNySak} variant="primary" icon={<Ikoner.AddOneWhite />}>
            Opprett ny sak/behandling
          </Nav.Button>
        </div>
      </div>
      <main id="main-container">
        <Nav.Container className="forside__container" fluid>
          <Nav.Row>
            <Nav.Column xs="6" lg="5">
              <ErrorBoundary
                kontekster={[
                  { slice: "oppgaver", varselTekst: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" },
                ]}
              >
                <JournalforingOppgaver />
              </ErrorBoundary>
            </Nav.Column>
            <Nav.Column xs="6" lg="7">
              <SokSkjema />
              <Saksplukker />
            </Nav.Column>
          </Nav.Row>
          <Nav.Row>
            <ErrorBoundary
              kontekster={[
                { slice: "oppgaver", varselTekst: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" },
              ]}
            >
              <BehandlingOppgaver />
            </ErrorBoundary>
          </Nav.Row>
        </Nav.Container>
      </main>
    </div>
  );
}

Forside.propTypes = {
  location: PT.object.isRequired,
  history: PT.object.isRequired,
  children: PT.node,
  tilOpprettNySak: PT.func.isRequired,
};

export default withRouter(Forside);
