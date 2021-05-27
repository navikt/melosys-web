/* eslint react/jsx-pascal-case: 0 */
import React from "react";
import { Route, Switch } from "react-router-dom";
import loadable from "@loadable/component";

import * as MKV from "@navikt/melosys-kodeverk";

import { FellesHandlersContext } from "../contexts";

const SideLoadingStatus = <div>Laster inn siden...</div>;

const UkjentSideLoadable = loadable(() => import("../sider/ukjentSide"), { fallback: SideLoadingStatus });
const ForsideLoadable = loadable(() => import("../sider/forside"), { fallback: SideLoadingStatus });
const SokLoadable = loadable(() => import("../sider/sok"), { fallback: SideLoadingStatus });
const EuEøsSaksbehandlingLoadable = loadable(() => import("../sider/eu_eøs/saksbehandling"), {
  fallback: SideLoadingStatus,
});
const FtrlSaksbehandlingLoadable = loadable(() => import("../sider/ftrl/saksbehandling"), {
  fallback: SideLoadingStatus,
});
const TrygdeavtaleSaksbehandlingLoadable = loadable(() => import("../sider/trygdeavtale/saksbehandling"), {
  fallback: SideLoadingStatus,
});
const JournalforingLoadable = loadable(() => import("../sider/journalforing"), { fallback: SideLoadingStatus });
const RegistreringUnntaksperioderLoadable = loadable(() => import("../sider/eu_eøs/registrering/unntaksperioder"), {
  fallback: SideLoadingStatus,
});
const RegistreringAnmodningunntakLoadable = loadable(() => import("../sider/eu_eøs/registrering/anmodningunntak"), {
  fallback: SideLoadingStatus,
});
const SedBehandlingLoadable = loadable(() => import("../sider/eu_eøs/sedbehandling"), { fallback: SideLoadingStatus });
const OpprettNySakLoadable = loadable(() => import("../sider/opprettnysak"), { fallback: SideLoadingStatus });
const VurderUtpekingLoadable = loadable(() => import("../sider/eu_eøs/vurderutpeking"), {
  fallback: SideLoadingStatus,
});

const { EU_EOS, FTRL } = MKV.Koder.sakstyper;

const Routing = () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => (
      <Switch>
        <Route exact path="/" render={(props) => <ForsideLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/sok" component={SokLoadable} />
        <Route
          exact
          path={`/${EU_EOS}/registrering/:snr/unntaksperioder`}
          render={(props) => <RegistreringUnntaksperioderLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          exact
          path={`/${EU_EOS}/registrering/:snr/anmodningunntak`}
          render={(props) => <RegistreringAnmodningunntakLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path={`/${EU_EOS}/sedbehandling/:snr`}
          render={(props) => <SedBehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path={`/${EU_EOS}/saksbehandling/:snr`}
          render={(props) => <EuEøsSaksbehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path={`/${FTRL}/saksbehandling/:snr`}
          render={(props) => <FtrlSaksbehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path="/TRYGDEAVTALE/saksbehandling/:snr"
          render={(props) => <TrygdeavtaleSaksbehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path="/journalforing/:journalpostID/:oppgaveID"
          render={(props) => <JournalforingLoadable {...props} {...fellesHandlers} />}
        />
        <Route path="/opprettnysak" render={(props) => <OpprettNySakLoadable {...props} {...fellesHandlers} />} />;
        <Route
          path={`/${EU_EOS}/vurderutpeking/:snr`}
          render={(props) => <VurderUtpekingLoadable {...props} {...fellesHandlers} />}
        />
        <Route component={UkjentSideLoadable} />
      </Switch>
    )}
  </FellesHandlersContext.Consumer>
);

export default Routing;
