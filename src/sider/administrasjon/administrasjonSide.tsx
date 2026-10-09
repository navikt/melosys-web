import { Route, Routes } from "react-router";

import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import UkjentSide from "../ukjentSide";
import AdministrasjonSidemeny from "./administrasjonSidemeny";
import OversiktSide from "./oversikt/oversiktSide";
import TekstblokkerSide from "../tekstblokker/tekstblokkerSide";
import { ADMIN_TEKSTBLOKKER_STI } from "./ruter";

import "./administrasjon.less";

function AdministrasjonSide() {
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  return (
    <div className="administrasjon">
      <AdministrasjonSidemeny />
      <main className="administrasjon__innhold">
        <Routes>
          <Route index element={<OversiktSide />} />
          {visTekstblokker && <Route path={ADMIN_TEKSTBLOKKER_STI} element={<TekstblokkerSide />} />}
          <Route path="*" element={<UkjentSide />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdministrasjonSide;
