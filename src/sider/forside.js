import React from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';

// import Statistikk from '../felles-komponenter/forside/statistikk';
import Journalforing from '../soknad-komponenter/forside/journalforing';
import Behandling from '../forside-komponenter/behandling';
import MineOppgaver from '../forside-komponenter/mineoppgaver';
import SokSkjema from '../soknad-komponenter/forside/sokskjema';

import './forside.css';

const Forside = props => {
  const { children } = props;
  return (
    <div className="forside">
      { children }
      <Nav.Container>
        <Nav.Row>
          <Nav.Column xs="7">
            <MineOppgaver />
          </Nav.Column>
          <Nav.Column className="hoyrekolonne" xs="5">
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
};

Forside.defaultProps = {
  children: null,
};

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
];
export default withErrorHandling(kontekster, withRouter(Forside));
