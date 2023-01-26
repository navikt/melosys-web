/* eslint react/jsx-pascal-case: 0 */
import React from "react";
import { Route, Switch } from "react-router-dom";
import loadable from "@loadable/component";

import * as MKV from "@navikt/melosys-kodeverk";

import { FellesHandlersContext } from "../contexts";

const SideLoadingStatus = <div>Laster inn siden...</div>;

const UkjentSideLoadable = loadable(() => import(/* webpackChunkName: "ukjent-side" */ "../sider/ukjentSide"), {
  fallback: SideLoadingStatus,
});
const ForsideLoadable = loadable(() => import(/* webpackChunkName: "forside" */ "../sider/forside"), {
  fallback: SideLoadingStatus,
});
const SokLoadable = loadable(() => import(/* webpackChunkName: "sok" */ "../sider/sok"), {
  fallback: SideLoadingStatus,
});
const EuEøsSaksbehandlingLoadable = loadable(
  () => import(/* webpackChunkName: "eu-eøs-saksbehandling" */ "../sider/eu_eøs/saksbehandling"),
  {
    fallback: SideLoadingStatus,
  }
);
const FtrlSaksbehandlingLoadable = loadable(
  () => import(/* webpackChunkName: "ftrl-saksbehandling" */ "../sider/ftrl/saksbehandling"),
  {
    fallback: SideLoadingStatus,
  }
);
const TrygdeavtaleSaksbehandlingLoadable = loadable(
  () => import(/* webpackChunkName: "trygdeavtale-saksbehandling" */ "../sider/trygdeavtale/saksbehandling"),
  {
    fallback: SideLoadingStatus,
  }
);
const SaksbehandlingIkkeYrkesaktivLoadable = loadable(
  () => import(/* webpackChunkName: "ikkeYrkesaktiv-saksbehandling" */ "../sider/ikkeYrkesaktiv/saksbehandling"),
  {
    fallback: SideLoadingStatus,
  }
);

const TomFlytBehandlingLoadable = loadable(
  () => import(/* webpackChunkName: "tom-flyt-behandling" */ "../sider/tomFlyt/behandling"),
  {
    fallback: SideLoadingStatus,
  }
);
const JournalforingLoadable = loadable(() => import(/* webpackChunkName: "journalføring" */ "../sider/journalforing"), {
  fallback: SideLoadingStatus,
});
const RegistreringUnntaksperioderLoadable = loadable(
  () => import(/* webpackChunkName: "registrering-unntaksperioder" */ "../sider/eu_eøs/registrering/unntaksperioder"),
  {
    fallback: SideLoadingStatus,
  }
);
const RegistreringAnmodningunntakLoadable = loadable(
  () =>
    import(/* webpackChunkName: "registrering-anmodning-om-unntak" */ "../sider/eu_eøs/registrering/anmodningunntak"),
  {
    fallback: SideLoadingStatus,
  }
);
const OpprettNySakLoadable = loadable(() => import(/* webpackChunkName: "opprett-ny-sak" */ "../sider/opprettnysak"), {
  fallback: SideLoadingStatus,
});
const VurderUtpekingLoadable = loadable(
  () => import(/* webpackChunkName: "vurder-utpeking" */ "../sider/eu_eøs/vurderutpeking"),
  {
    fallback: SideLoadingStatus,
  }
);
const SendbrevLoadable = loadable(() => import(/* webpackChunkName: "sendbrev" */ "../sider/sendbrev"), {
  fallback: SideLoadingStatus,
});

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

const Routing = () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => (
      <Switch>
        <Route exact path="/" render={(props) => <ForsideLoadable {...props} {...fellesHandlers} />} />
        <Route exact path="/sok" component={SokLoadable} />
        <Route
          exact
          path={`/${EU_EOS}/registrering/:saksnr/unntaksperioder`}
          render={(props) => <RegistreringUnntaksperioderLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          exact
          path={`/${EU_EOS}/registrering/:saksnr/anmodningunntak`}
          render={(props) => <RegistreringAnmodningunntakLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path={`/${EU_EOS}/saksbehandling/:saksnr`}
          render={(props) => <EuEøsSaksbehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path={`/${FTRL}/saksbehandling/:saksnr`}
          render={(props) => <FtrlSaksbehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path="/:sakstype/ikkeYrkesaktiv/:saksnr"
          render={(props) => <SaksbehandlingIkkeYrkesaktivLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path={`/${TRYGDEAVTALE}/saksbehandling/:saksnr`}
          render={(props) => <TrygdeavtaleSaksbehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path="/:sakstype/behandling/:saksnr"
          render={(props) => <TomFlytBehandlingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path="/journalforing/:journalpostID/:oppgaveID"
          render={(props) => <JournalforingLoadable {...props} {...fellesHandlers} />}
        />
        <Route path="/opprettnysak" render={(props) => <OpprettNySakLoadable {...props} {...fellesHandlers} />} />;
        <Route
          path={`/${EU_EOS}/vurderutpeking/:saksnr`}
          render={(props) => <VurderUtpekingLoadable {...props} {...fellesHandlers} />}
        />
        <Route
          path="/sendbrev/:behandlingID/:snr"
          render={(props) => <SendbrevLoadable {...props} {...fellesHandlers} />}
        />
        <Route component={UkjentSideLoadable} />
      </Switch>
    )}
  </FellesHandlersContext.Consumer>
);

export default Routing;
