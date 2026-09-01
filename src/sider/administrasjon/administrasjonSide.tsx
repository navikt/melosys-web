import { Route, Switch } from "react-router-dom";

import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import UkjentSide from "../ukjentSide";
import AdministrasjonSidemeny from "./administrasjonSidemeny";
import OversiktSide from "./oversikt/oversiktSide";
import TekstblokkerSide from "../tekstblokker/tekstblokkerSide";
import { ADMIN_BASE, ADMIN_TEKSTBLOKKER } from "./ruter";

import "./administrasjon.less";

function AdministrasjonSide() {
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  return (
    <div className="administrasjon">
      <AdministrasjonSidemeny />
      <main className="administrasjon__innhold">
        <Switch>
          <Route exact path={ADMIN_BASE} component={OversiktSide} />
          {visTekstblokker && <Route exact path={ADMIN_TEKSTBLOKKER} component={TekstblokkerSide} />}
          <Route component={UkjentSide} />
        </Switch>
      </main>
    </div>
  );
}

export default AdministrasjonSide;
