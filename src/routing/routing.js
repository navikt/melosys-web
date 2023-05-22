/* eslint react/jsx-pascal-case: 0 */
import React from "react";
import { Route, Switch } from "react-router-dom";
import * as Sentry from "@sentry/react";
import * as MKV from "@navikt/melosys-kodeverk";

import { FellesHandlersContext } from "../contexts";

const Forside = React.lazy(() => import("../sider/forside"));
const Unntaksperioder = React.lazy(() => import("../sider/eu_eøs/registrering/unntaksperioder"));
const Anmodningsunntak = React.lazy(() => import("../sider/eu_eøs/registrering/anmodningunntak"));
const Sok = React.lazy(() => import("../sider/sok"));
const EuEøsSaksbehandling = React.lazy(() => import("../sider/eu_eøs/saksbehandling"));
const FtrlSaksbehandling = React.lazy(() => import("../sider/ftrl/saksbehandling"));
const TrygdeavtaleSaksbehandling = React.lazy(() => import("../sider/trygdeavtale/saksbehandling"));
const TomFlytBehandling = React.lazy(() => import("../sider/tomFlyt/behandling"));
const Journalforing = React.lazy(() => import("../sider/journalforing"));
const OpprettNySak = React.lazy(() => import("../sider/opprettnysak"));
const VurderUtpeking = React.lazy(() => import("../sider/eu_eøs/vurderutpeking"));
const Sendbrev = React.lazy(() => import("../sider/sendbrev"));
const IkkeYrkesaktiv = React.lazy(() => import("../sider/ikkeYrkesaktiv/saksbehandling"));
const Unntaksregistrering = React.lazy(() => import("../sider/unntaksregistrering"));
const UkjentSide = React.lazy(() => import("../sider/ukjentSide"));

const SentryRoute = Sentry.withSentryRouting(Route);

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

const Routing = () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => (
      <Switch>
        <SentryRoute exact path="/" render={(props) => <Forside {...props} {...fellesHandlers} />} />
        <SentryRoute exact path="/sok" component={Sok} />
        <SentryRoute
          exact
          path={`/${EU_EOS}/registrering/:saksnr/unntaksperioder`}
          render={(props) => <Unntaksperioder {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          exact
          path={`/${EU_EOS}/registrering/:saksnr/anmodningunntak`}
          render={(props) => <Anmodningsunntak {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path={`/${EU_EOS}/saksbehandling/:saksnr`}
          render={(props) => <EuEøsSaksbehandling {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path={`/${FTRL}/saksbehandling/:saksnr`}
          render={(props) => <FtrlSaksbehandling {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path="/:sakstype/ikkeYrkesaktiv/:saksnr"
          render={(props) => <IkkeYrkesaktiv {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path={`/${TRYGDEAVTALE}/saksbehandling/:saksnr`}
          render={(props) => <TrygdeavtaleSaksbehandling {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path="/:sakstype/behandling/:saksnr"
          render={(props) => <TomFlytBehandling {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path="/journalforing/:journalpostID/:oppgaveID"
          render={(props) => <Journalforing {...props} {...fellesHandlers} />}
        />
        <SentryRoute path="/opprettnysak" render={(props) => <OpprettNySak {...props} {...fellesHandlers} />} />;
        <SentryRoute
          path={`/${EU_EOS}/vurderutpeking/:saksnr`}
          render={(props) => <VurderUtpeking {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path="/sendbrev/:behandlingID/:snr"
          render={(props) => <Sendbrev {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path="/:sakstype/unntaksregistrering/:saksnr"
          render={(props) => <Unntaksregistrering {...props} {...fellesHandlers} />}
        />
        <SentryRoute component={UkjentSide} />
      </Switch>
    )}
  </FellesHandlersContext.Consumer>
);

export default Routing;
