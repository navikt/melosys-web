import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import loadable from '@loadable/component';
import PT from 'prop-types';
import * as Utils from './utils';

const UkjentSideLoadable = loadable(() => import('./sider/ukjentSide'));
const ForsideLoadable = loadable(() => import('./sider/forside'));
const SokLoadable = loadable(() => import('./sider/sok'));
const SaksbehandlingLoadable = loadable(() => import('./sider/saksbehandling'));
const JournalforingLoadable = loadable(() => import('./sider/journalforing'));
const RegistreringLoadable = loadable(() => import('./sider/registrering'));

const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={ForsideLoadable} />
    <Route exact path="/sok/:fnr" component={SokLoadable} />
    {Utils.feature.featureToggle('REL1.1') && <Route exact path="/registrering/:snr" component={RegistreringLoadable} />}
    <Route path="/saksbehandling/:snr" component={SaksbehandlingLoadable} />
    <Route path="/journalforing/:journalpostID/:oppgaveID" component={JournalforingLoadable} />
    <Route component={UkjentSideLoadable} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
