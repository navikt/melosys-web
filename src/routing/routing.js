import React from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';

import { FellesHandlersContext } from '../contexts';

const SideLoadingStatus = <div>Laster inn siden...</div>;

const UkjentSideLoadable = loadable(() => import('../sider/ukjentSide'), { fallback: SideLoadingStatus });
const ForsideLoadable = loadable(() => import('../sider/forside'), { fallback: SideLoadingStatus });
const SokLoadable = loadable(() => import('../sider/sok'), { fallback: SideLoadingStatus });
const SaksbehandlingLoadable = loadable(() => import('../sider/saksbehandling'), { fallback: SideLoadingStatus });
const JournalforingLoadable = loadable(() => import('../sider/journalforing'), { fallback: SideLoadingStatus });
const RegistreringUnntaksperioderLoadable = loadable(() => import('../sider/registrering/unntaksperioder'), { fallback: SideLoadingStatus });
const RegistreringAnmodningunntakLoadable = loadable(() => import('../sider/registrering/anmodningunntak'), { fallback: SideLoadingStatus });
const SedBehandlingLoadable = loadable(() => import('../sider/sedbehandling'), { fallback: SideLoadingStatus });
const OpprettNySakLoadable = loadable(() => import('../sider/opprettnysak'), { fallback: SideLoadingStatus });
const VurderUtpekingLoadable = loadable(() => import('../sider/vurderutpeking'), { fallback: SideLoadingStatus });

const Routing = () => (
  <FellesHandlersContext.Consumer>
    { fellesHandlers =>
      <Switch>
        <Route exact path="/" render={props => <ForsideLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/sok/:fnr" component={SokLoadable} />
        <Route exact path="/registrering/:snr/unntaksperioder" render={props => <RegistreringUnntaksperioderLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/registrering/:snr/anmodningunntak" render={props => <RegistreringAnmodningunntakLoadable {...props} {...fellesHandlers} />} />
        <Route path="/sedbehandling/:snr" render={props => <SedBehandlingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/saksbehandling/:snr" render={props => <SaksbehandlingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/journalforing/:journalpostID/:oppgaveID" render={props => <JournalforingLoadable {...props} {...fellesHandlers} />} />
        <Route path="/opprettnysak" render={props => <OpprettNySakLoadable {...props} {...fellesHandlers} />} />;
        <Route path="/vurderutpeking/:snr" render={props => <VurderUtpekingLoadable {...props} {...fellesHandlers} />} />
        <Route component={UkjentSideLoadable} />
      </Switch>
    }
  </FellesHandlersContext.Consumer>
);

export default Routing;
