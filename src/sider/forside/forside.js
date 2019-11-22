import React from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../../felleskomponenter/withErrorHandling';
import * as Nav from '../../utils/navFrontend';

import Journalforing from './komponenter/journalforing';
import Behandling from './komponenter/behandling';
import MineOppgaver from './komponenter/mineoppgaver';
import SokSkjema from './komponenter/sokskjema';
import OpprettNySakKnapp from './komponenter/opprettnysakknapp';

import './forside.css';

const Forside = props => {
  const { children, tilOpprettNySak } = props;

  return (
    <div className="forside">
      { children }
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <MineOppgaver />
          </Nav.Column>
          <Nav.Column className="hoyrekolonne" xs="5">
            <OpprettNySakKnapp onClick={tilOpprettNySak} />
            <SokSkjema />
            <Journalforing />
            <Behandling />
          </Nav.Column>
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

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
];

export default withErrorHandling(kontekster, withRouter(Forside));
