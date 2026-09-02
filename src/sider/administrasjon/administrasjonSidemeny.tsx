import { NavLink } from "react-router-dom";

import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import { ADMIN_BASE, ADMIN_TEKSTBLOKKER } from "./ruter";

interface MenyValg {
  tittel: string;
  sti: string;
  exact?: boolean;
  synlig: boolean;
}

function AdministrasjonSidemeny() {
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  const valg: MenyValg[] = [
    { tittel: "Oversikt", sti: ADMIN_BASE, exact: true, synlig: true },
    { tittel: "Brev- og tekstbibliotek", sti: ADMIN_TEKSTBLOKKER, synlig: Boolean(visTekstblokker) },
  ];

  return (
    <nav className="administrasjon__sidemeny" aria-label="Administrasjon">
      <ul className="administrasjon__sidemeny-liste">
        {valg
          .filter((v) => v.synlig)
          .map((v) => (
            <li key={v.sti}>
              <NavLink
                to={v.sti}
                exact={v.exact}
                className="administrasjon__sidemeny-lenke"
                activeClassName="administrasjon__sidemeny-lenke--aktiv"
                aria-current="page"
              >
                {v.tittel}
              </NavLink>
            </li>
          ))}
      </ul>
    </nav>
  );
}

export default AdministrasjonSidemeny;
