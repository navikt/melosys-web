import { NavLink, useRouteMatch } from "react-router-dom";

import TekstblokkSoek from "../../../felleskomponenter/htmlEditor/tekstblokkSoek";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../../featuretoggle/toggleNavn";
import { BREVBIBLIOTEK, SAKSRUTER } from "../../tekstblokker/ruter";

const TITTEL = "Brev- og tekstbibliotek";

// Biblioteket skal være tilgjengelig overalt, men på to måter. Står saksbehandleren i en
// sak, er poenget å slå opp uten å forlate den – da åpner knappen en popover med sakens
// avgrensning. Utenfor en sak finnes ingen kontekst å avgrense mot, og hele biblioteket
// har bedre plass på en egen side.
function BrevbibliotekKnapp() {
  const togglePaa = useFeatureToggle(MELOSYS_TEKSTBLOKKER);
  // Ruten avgjør, ikke redux: en fagsak kan ligge igjen i state etter at brukeren har
  // navigert bort, og ville da gitt popoveren på forsiden.
  const iSak = useRouteMatch(SAKSRUTER) !== null;

  if (!togglePaa) return null;

  if (iSak) {
    return (
      <div className="topplinje__bibliotek">
        <TekstblokkSoek
          modus="bibliotek"
          visBrevmaler
          placement="bottom-end"
          knappetekst={TITTEL}
          overskrift={TITTEL}
        />
      </div>
    );
  }

  return (
    <NavLink to={BREVBIBLIOTEK} className="topplinje__menylenke">
      {TITTEL}
    </NavLink>
  );
}

export default BrevbibliotekKnapp;
