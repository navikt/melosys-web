import { useHistory, useLocation } from "react-router-dom";

import useFeatureToggle from "../../featuretoggle/useFeatureToggle";
import { MELOSYS_TEKSTBLOKKER } from "../../featuretoggle/toggleNavn";

interface MenyValg {
  tittel: string;
  sti: string;
  synlig: boolean;
}

function AdministrasjonSidemeny() {
  const history = useHistory();
  const { pathname } = useLocation();
  const visTekstblokker = useFeatureToggle(MELOSYS_TEKSTBLOKKER);

  const valg: MenyValg[] = [
    { tittel: "Oversikt", sti: "/administrasjon", synlig: true },
    { tittel: "Tekstblokker", sti: "/administrasjon/tekstblokker", synlig: Boolean(visTekstblokker) },
  ];

  const erAktiv = (sti: string) => {
    if (sti === "/administrasjon") return pathname === sti;
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
                <a
                  href={v.sti}
                  onClick={(e) => {
                    e.preventDefault();
                    history.push(v.sti);
                  }}
                  aria-current={aktiv ? "page" : undefined}
                  className={`administrasjon__sidemeny-lenke${aktiv ? " administrasjon__sidemeny-lenke--aktiv" : ""}`}
                >
                  {v.tittel}
                </a>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

export default AdministrasjonSidemeny;
