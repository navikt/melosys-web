import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { withRouter } from "react-router-dom";
import PT from "prop-types";

import withErrorHandling from "../../felleskomponenter/withErrorHandling";
import * as Nav from "../../navFrontend";

import { oversikt } from "../../ducks/oppgaver/operations";
import Saksplukker from "./komponenter/saksplukker";
import SokSkjema from "./komponenter/sokskjema";
import JournalforingOppgaver from "./komponenter/mineoppgaver/jornualforingoppgaver";
import BehandlingOppgaver from "./komponenter/mineoppgaver/behandlingOppgaver";

import OpprettNySakKnapp from "./komponenter/opprettnysakknapp";

import "./forside.css";
import { featureToggleOperations } from "../../ducks/featuretoggle";

const Forside = (props) => {
  const { tilOpprettNySak } = props;
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
          <Nav.Typo.Undertittel>Mine oppgaver</Nav.Typo.Undertittel>
          <Nav.Typo.Normaltekst>{oppgaverTotalt} oppgaver</Nav.Typo.Normaltekst>
        </div>
        <OpprettNySakKnapp onClick={tilOpprettNySak} />
      </div>
      <Nav.Container className="forside__container" fluid>
        <Nav.Row>
          <Nav.Column xs="6" lg="5">
            <JournalforingOppgaver />
          </Nav.Column>
          <Nav.Column xs="6" lg="7">
            <SokSkjema />
            <Saksplukker />
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <BehandlingOppgaver />
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Forside.propTypes = {
  location: PT.object.isRequired,
  history: PT.object.isRequired,
  children: PT.node,
  tilOpprettNySak: PT.func.isRequired,
};

Forside.defaultProps = {
  children: null,
};

const kontekster = [{ navn: "fagsaker", melding: "Det har oppstått en feil: Kunne ikke hente fagsaker" }];

export default withErrorHandling(kontekster, withRouter(Forside));
