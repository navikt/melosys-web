import React, { Suspense } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';

import './forside.css';

const Journalforing = React.lazy(() => import('../soknad-komponenter/forside/journalforing'));
const Behandling = React.lazy(() => import('../forside-komponenter/behandling'));
const MineOppgaver = React.lazy(() => import('../forside-komponenter/mineoppgaver'));
const SokSkjema = React.lazy(() => import('../soknad-komponenter/forside/sokskjema'));

const Forside = props => {
  const { children } = props;
  return (
    <div className="forside">
      { children }
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
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
