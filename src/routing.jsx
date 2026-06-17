import { Route, Switch } from "react-router-dom";
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
import IkkeYrkesaktiv from "./sider/ikkeYrkesaktiv/saksbehandling";
import Årsavregning from "./sider/aarsavregning/saksbehandling";
import Unntaksregistrering from "./sider/unntaksregistrering";
import UkjentSide from "./sider/ukjentSide";
import EøsPensjonist from "./sider/eu_eøs/pensjonist/saksbehandling";
import AdministrasjonSide from "./sider/administrasjon/administrasjonSide";
import { ADMIN_BASE } from "./sider/administrasjon/ruter";
import useFeatureToggle from "./featuretoggle/useFeatureToggle";
import { MELOSYS_ADMINISTRASJON } from "./featuretoggle/toggleNavn";

import { FellesHandlersContext } from "./contexts";
import ErrorBoundary from "./felleskomponenter/errorBoundary";

function AdministrasjonRute(props) {
  const togglePaa = useFeatureToggle(MELOSYS_ADMINISTRASJON);
  if (togglePaa === false) return <UkjentSide />;
  if (togglePaa === undefined) return null;
  return <AdministrasjonSide {...props} />;
}

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

function Routing() {
  return (
    <FellesHandlersContext.Consumer>
      {(fellesHandlers) => (
        <Switch>
          <Route
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
          <Route
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
          <Route
            exact
            path={`/${EU_EOS}/registrering/:saksnr/unntaksperioder`}
            render={(props) => <Unntaksperioder {...props} {...fellesHandlers} />}
          />
          <Route
            exact
            path={`/${EU_EOS}/registrering/:saksnr/anmodningunntak`}
            render={(props) => <Anmodningsunntak {...props} {...fellesHandlers} />}
          />
          <Route
            path={`/${EU_EOS}/saksbehandling/:saksnr`}
            render={(props) => <EuEøsSaksbehandling {...props} {...fellesHandlers} />}
          />
          <Route
            path={`/${FTRL}/saksbehandling/:saksnr`}
            render={(props) => <FtrlSaksbehandling {...props} {...fellesHandlers} />}
          />
          <Route
            path="/:sakstype/ikkeYrkesaktiv/:saksnr"
            render={(props) => <IkkeYrkesaktiv {...props} {...fellesHandlers} />}
          />
          <Route
            path={`/${TRYGDEAVTALE}/saksbehandling/:saksnr`}
            render={(props) => <TrygdeavtaleSaksbehandling {...props} {...fellesHandlers} />}
          />
          <Route
            path="/:sakstype/aarsavregning/:saksnr"
            render={(props) => <Årsavregning {...props} {...fellesHandlers} />}
          />
          <Route
            path={`/${EU_EOS}/pensjonist/:saksnr`}
            render={(props) => <EøsPensjonist {...props} {...fellesHandlers} />}
          />
          <Route
            path="/:sakstype/behandling/:saksnr"
            render={(props) => <IngenFlytBehandling {...props} {...fellesHandlers} />}
          />
          <Route
            path="/journalforing/:journalpostID/:oppgaveID"
            render={(props) => <Journalforing {...props} {...fellesHandlers} />}
          />
          <Route path="/opprettnysak" render={(props) => <OpprettNySak {...props} {...fellesHandlers} />} />;
          <Route
            path={`/${EU_EOS}/vurderutpeking/:saksnr`}
            render={(props) => <VurderUtpeking {...props} {...fellesHandlers} />}
          />
          <Route path={ADMIN_BASE} render={(props) => <AdministrasjonRute {...props} />} />
          <Route
            path="/:sakstype/unntaksregistrering/:saksnr"
            render={(props) => <Unntaksregistrering {...props} {...fellesHandlers} />}
          />
          <Route component={UkjentSide} />
        </Switch>
      )}
    </FellesHandlersContext.Consumer>
  );
}

export default Routing;
