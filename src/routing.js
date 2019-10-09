import React, { useState, useEffect } from 'react';
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
const RegistreringUnntaksperioderLoadable = loadable(() => import('./sider/registrering/unntaksperioder'), { fallback: SideLoadingStatus });
const RegistreringAnmodningunntakLoadable = loadable(() => import('./sider/registrering/anmodningunntak'), { fallback: SideLoadingStatus });
const VurderTrygdetidLoadable = loadable(() => import('./sider/vurdertrygdetid'), { fallback: SideLoadingStatus });

const Routing = ({ location }) => {
  const [featureToggle, setFeatureToggle] = useState(false);

  useEffect(() => {
    (async () => setFeatureToggle(await Utils.feature.namespaceToggle('q2', 't8')))();
  });

  return (
    <ErrorBoundary message={SideLoadingFailMessage}>
      <Switch location={location}>
        <Route exact path="/" component={ForsideLoadable} />
        <Route exact path="/sok/:fnr" component={SokLoadable} />
        {featureToggle && <Route exact path="/registrering/:snr/unntaksperioder" component={RegistreringUnntaksperioderLoadable} />}
        {featureToggle && <Route exact path="/registrering/:snr/anmodningunntak" component={RegistreringAnmodningunntakLoadable} />}
        <Route path="/vurdertrygdetid/:snr" component={VurderTrygdetidLoadable} />
        <Route path="/saksbehandling/:snr" component={SaksbehandlingLoadable} />
        <Route path="/journalforing/:journalpostID/:oppgaveID" component={JournalforingLoadable} />
        <Route component={UkjentSideLoadable} />
      </Switch>
    </ErrorBoundary>
  );
};

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
