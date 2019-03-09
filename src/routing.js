import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Loadable from 'react-loadable';
import PT from 'prop-types';

import SideLoadingStatus from './komponenter/SideLoadingStatus';

const UkjentSideLoadable = Loadable({
  loader: () => import('./sider/ukjentSide'),
  loading: SideLoadingStatus,
});
const ForsideLoadable = Loadable({
  loader: () => import('./sider/forside'),
  loading: SideLoadingStatus,
});
const SokLoadable = Loadable({
  loader: () => import('./sider/sok'),
  loading: SideLoadingStatus,
});
const SaksbehandlingLoadable = Loadable({
  loader: () => import('./sider/saksbehandling'),
  loading: SideLoadingStatus,
});
const JournalforingLoadable = Loadable({
  loader: () => import('./sider/journalforing'),
  loading: SideLoadingStatus,
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
