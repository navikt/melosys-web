import { NavLink, useLocation } from "react-router-dom";

import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";
import { ADMIN_BASE, ADMIN_TEKSTBLOKKER } from "./ruter";

interface MenyValg {
  tittel: string;
  sti: string;
  synlig: boolean;
}

function AdministrasjonSidemeny() {
  const { pathname } = useLocation();
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  const valg: MenyValg[] = [
    { tittel: "Oversikt", sti: ADMIN_BASE, synlig: true },
    { tittel: "Tekstblokker", sti: ADMIN_TEKSTBLOKKER, synlig: Boolean(visTekstblokker) },
  ];

  const erAktiv = (sti: string) => {
    if (sti === ADMIN_BASE) return pathname === sti;
    return pathname.startsWith(sti);
  };

  return (
    <nav className="administrasjon__sidemeny" aria-label="Administrasjon">
      <ul className="administrasjon__sidemeny-liste">
        {valg
          .filter((v) => v.synlig)
          .map((v) => {
            const aktiv = erAktiv(v.sti);
            return (
              <li key={v.sti}>
                <NavLink
                  to={v.sti}
                  exact={v.sti === ADMIN_BASE}
                  aria-current={aktiv ? "page" : undefined}
                  className={`administrasjon__sidemeny-lenke${aktiv ? " administrasjon__sidemeny-lenke--aktiv" : ""}`}
                >
                  {v.tittel}
                </NavLink>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

export default AdministrasjonSidemeny;
