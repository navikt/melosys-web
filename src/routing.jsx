import { Route, Switch } from "react-router-dom";
import * as Sentry from "@sentry/react";
import * as MKV from "@navikt/melosys-kodeverk";
import Forside from "./sider/forside";
import Unntaksperioder from "./sider/eu_eøs/registrering/unntaksperioder";
import Anmodningsunntak from "./sider/eu_eøs/registrering/anmodningunntak";
import Sok from "./sider/sok";
import EuEøsSaksbehandling from "./sider/eu_eøs/saksbehandling";
import FtrlSaksbehandling from "./sider/ftrl/saksbehandling";
import TrygdeavtaleSaksbehandling from "./sider/trygdeavtale/saksbehandling";
import IngenFlytBehandling from "./sider/ingenFlyt/behandling";
import Journalforing from "./sider/journalforing";
import OpprettNySak from "./sider/opprettnysak";
import VurderUtpeking from "./sider/eu_eøs/vurderutpeking";
import Sendbrev from "./sider/sendbrev";
import IkkeYrkesaktiv from "./sider/ikkeYrkesaktiv/saksbehandling";
import Unntaksregistrering from "./sider/unntaksregistrering";
import UkjentSide from "./sider/ukjentSide";

import { FellesHandlersContext } from "./contexts";
import ErrorBoundary from "./felleskomponenter/errorBoundary";

const SentryRoute = Sentry.withSentryRouting(Route);

const { EU_EOS, FTRL, TRYGDEAVTALE, ÅRSAVREGNING } = MKV.Koder.sakstyper;

const Routing = () => (
  <FellesHandlersContext.Consumer>
    {(fellesHandlers) => (
      <Switch>
        <SentryRoute
          exact
          path="/"
          render={(props) => (
            <ErrorBoundary
              kontekster={[
                {
                  slice: "fagsaker",
                  varselTekst: "Det har oppstått en feil: Kunne ikke hente fagsaker",
                },
              ]}
            >
              <Forside {...props} {...fellesHandlers} />
            </ErrorBoundary>
          )}
        />
        <SentryRoute
          exact
          path="/sok"
          render={(props) => (
            <ErrorBoundary
              kontekster={[
                { slice: "fagsaker", varselTekst: "Det har oppstått en feil: Kunne ikke hente fagsaker" },
                { slice: "oppgaver", varselTekst: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" },
              ]}
            >
              <Sok {...props} />
            </ErrorBoundary>
          )}
        />
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
          path={`/${ÅRSAVREGNING}/årsavregning/:saksnr`}
          render={(props) => <ÅRSAVREGNING {...props} {...fellesHandlers} />}
        />
        <SentryRoute
          path="/:sakstype/behandling/:saksnr"
          render={(props) => <IngenFlytBehandling {...props} {...fellesHandlers} />}
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
