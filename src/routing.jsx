import { Route, Routes } from "react-router";
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
import BrevbibliotekSide from "./sider/tekstblokker/brevbibliotekSide";
import { BREVBIBLIOTEK } from "./sider/tekstblokker/ruter";
import useFeatureToggle from "./featuretoggle/useFeatureToggle";
import { MELOSYS_ADMINISTRASJON } from "./featuretoggle/toggleNavn";

import { FellesHandlersContext } from "./contexts";
import ErrorBoundary from "./felleskomponenter/errorBoundary";

function AdministrasjonRute() {
  const togglePaa = useFeatureToggle(MELOSYS_ADMINISTRASJON);
  if (togglePaa === false) return <UkjentSide />;
  if (togglePaa === undefined) return null;
  return <AdministrasjonSide />;
}

const { EU_EOS, FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;

function Routing() {
  return (
    <FellesHandlersContext.Consumer>
      {(fellesHandlers) => (
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary
                kontekster={[
                  {
                    slice: "fagsaker",
                    varselTekst: "Det har oppstått en feil: Kunne ikke hente fagsaker",
                  },
                ]}
              >
                <Forside {...fellesHandlers} />
              </ErrorBoundary>
            }
          />
          <Route
            path="/sok"
            element={
              <ErrorBoundary
                kontekster={[
                  { slice: "fagsaker", varselTekst: "Det har oppstått en feil: Kunne ikke hente fagsaker" },
                  { slice: "oppgaver", varselTekst: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" },
                ]}
              >
                <Sok />
              </ErrorBoundary>
            }
          />
          <Route
            path={`/${EU_EOS}/registrering/:saksnr/unntaksperioder`}
            element={<Unntaksperioder {...fellesHandlers} />}
          />
          <Route
            path={`/${EU_EOS}/registrering/:saksnr/anmodningunntak`}
            element={<Anmodningsunntak {...fellesHandlers} />}
          />
          <Route path={`/${EU_EOS}/saksbehandling/:saksnr/*`} element={<EuEøsSaksbehandling {...fellesHandlers} />} />
          <Route path={`/${FTRL}/saksbehandling/:saksnr/*`} element={<FtrlSaksbehandling {...fellesHandlers} />} />
          <Route path="/:sakstype/ikkeYrkesaktiv/:saksnr/*" element={<IkkeYrkesaktiv {...fellesHandlers} />} />
          <Route
            path={`/${TRYGDEAVTALE}/saksbehandling/:saksnr/*`}
            element={<TrygdeavtaleSaksbehandling {...fellesHandlers} />}
          />
          <Route path="/:sakstype/aarsavregning/:saksnr/*" element={<Årsavregning {...fellesHandlers} />} />
          <Route path={`/${EU_EOS}/pensjonist/:saksnr/*`} element={<EøsPensjonist {...fellesHandlers} />} />
          <Route path="/:sakstype/behandling/:saksnr/*" element={<IngenFlytBehandling {...fellesHandlers} />} />
          <Route path="/journalforing/:journalpostID/:oppgaveID/*" element={<Journalforing {...fellesHandlers} />} />
          <Route path="/opprettnysak/*" element={<OpprettNySak {...fellesHandlers} />} />
          <Route path={`/${EU_EOS}/vurderutpeking/:saksnr/*`} element={<VurderUtpeking {...fellesHandlers} />} />
          <Route path={`${ADMIN_BASE}/*`} element={<AdministrasjonRute />} />
          {/* Biblioteket er et oppslagsverk for saksbehandlere, ikke en admin-flate,
              så det gates på melosys.tekstblokker alene. */}
          <Route path={`${BREVBIBLIOTEK}/*`} element={<BrevbibliotekSide />} />
          <Route
            path="/:sakstype/unntaksregistrering/:saksnr/*"
            element={<Unntaksregistrering {...fellesHandlers} />}
          />
          <Route path="*" element={<UkjentSide />} />
        </Routes>
      )}
    </FellesHandlersContext.Consumer>
  );
}

export default Routing;
