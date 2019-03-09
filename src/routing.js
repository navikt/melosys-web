import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Loadable from 'react-loadable';
import PT from 'prop-types';

import MinSideLasteStatus from './komponenter/MinSideLasteStatus';

const UkjentSideLoadable = Loadable({
  loader: () => import('./sider/ukjentSide'),
  loading: MinSideLasteStatus,
});
const ForsideLoadable = Loadable({
  loader: () => import('./sider/forside'),
  loading: MinSideLasteStatus,
});
const SokLoadable = Loadable({
  loader: () => import('./sider/sok'),
  loading: MinSideLasteStatus,
});
const SaksbehandlingLoadable = Loadable({
  loader: () => import('./sider/saksbehandling'),
  loading: MinSideLasteStatus,
});
const JournalforingLoadable = Loadable({
  loader: () => import('./sider/journalforing'),
  loading: MinSideLasteStatus,
});

const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={ForsideLoadable} />
    <Route exact path="/sok/:fnr" component={SokLoadable} />
    <Route path="/saksbehandling/:snr" component={SaksbehandlingLoadable} />
    <Route path="/journalforing/:journalpostID/:oppgaveID" component={JournalforingLoadable} />
    <Route component={UkjentSideLoadable} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
