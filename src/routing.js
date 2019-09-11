import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import loadable from '@loadable/component';
import PT from 'prop-types';
import * as Utils from './utils';
import ErrorBoundary from './felleskomponenter/ErrorBoundary';

const SideLoadingStatus = <div>Laster inn side komponenten!</div>;
const SideLoadingFailMessage = 'Beklager, kan ikke laste inn side komponenten.';

const UkjentSideLoadable = loadable(() => import('./sider/ukjentSide'), { fallback: SideLoadingStatus });
const ForsideLoadable = loadable(() => import('./sider/forside'), { fallback: SideLoadingStatus });
const SokLoadable = loadable(() => import('./sider/sok'), { fallback: SideLoadingStatus });
const SaksbehandlingLoadable = loadable(() => import('./sider/saksbehandling'), { fallback: SideLoadingStatus });
const JournalforingLoadable = loadable(() => import('./sider/journalforing'), { fallback: SideLoadingStatus });
const RegistreringLoadable = loadable(() => import('./sider/registrering'), { fallback: SideLoadingStatus });

const Routing = ({ location }) => (
  <Switch location={location}>
    <ErrorBoundary message={SideLoadingFailMessage}>
      <Route exact path="/" component={ForsideLoadable} />
      <Route exact path="/sok/:fnr" component={SokLoadable} />
      {Utils.feature.featureToggle('REL1.1') && <Route exact path="/registrering/:snr" component={RegistreringLoadable} />}
      <Route path="/saksbehandling/:snr" component={SaksbehandlingLoadable} />
      <Route path="/journalforing/:journalpostID/:oppgaveID" component={JournalforingLoadable} />
      <Route component={UkjentSideLoadable} />
    </ErrorBoundary>
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
