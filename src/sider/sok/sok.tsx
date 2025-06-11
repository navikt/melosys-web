import { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import Fagsak from "../../felleskomponenter/oppgaveliste/fagsak";
import SorterbarListe from "../../felleskomponenter/sorterbarListe";
import { landkoderOperations, landkoderSelectors } from "../../ducks/landkoder";
import { sokOperations, sokSelectors } from "../../ducks/sok";

import "./sok.css";
import { Spinner } from "../../felleskomponenter/spinner";
import { feiletResponsOperations } from "../../ducks/feiletRespons";
import { Feilmeldinger } from "../../felleskomponenter/feilmeldinger";

export interface SokProps {
  children?: ReactElement;
}

export function Sok({ children }: SokProps) {
  const dispatch = useDispatch();
  const sokResultat = useSelector(sokSelectors.FagsakSokSelector);
  const landkoder = useSelector(landkoderSelectors.LandkoderSelector);
  const [sokPending, setSokPending] = useState(false);
  const sokefrase = sessionStorage.getItem("sokefrase");

  const initialize = async () => {
    dispatch(landkoderOperations.hentLandkoder());
    if (sokefrase) {
      setSokPending(true);
      dispatch(sokOperations.sok(sokefrase));
      setSokPending(false);
    }
  };

  useEffect(() => {
    initialize();

    return () => {
      sessionStorage.removeItem("sokefrase");
      dispatch(feiletResponsOperations.resetFeiletRespons());
    };
  }, []);

  if (!sokResultat) return null;

  const enhet = (value: string | null): string => {
    if (Utils.person.erGyldigFnr(value)) {
      return `f.nr./d-nr. ${value}`;
    }
    if (Utils.organisasjon.erOrgnrGyldig(value)) {
      return `org.nr. ${value}`;
    }
    return `saksnummer ${value}`;
  };

  const ingenTreff = <div className="panel">Fant ingen saker knyttet til {enhet(sokefrase)}.</div>;

  return (
    <div className="sok">
      {children}
      <Nav.Container>
        <Nav.Row className="">
          <section className="sokresultat">
            <h1>Saksoversikt</h1>
            <h2>
              Resultater for {enhet(sokefrase)}
              {sokResultat.length > 0 ? ` - ${sokResultat[0].navn}` : undefined}
            </h2>
            <Feilmeldinger />
            {sokPending ? (
              <Spinner />
            ) : (
              <>
                {sokResultat.length > 0 && (
                  <SorterbarListe
                    elementer={sokResultat}
                    component={Fagsak}
                    defaultChecked="descending"
                    sortingLegend="Sorter fagsaker etter opprettelsesdato:"
                    sortingPath="opprettetDato"
                    radioGroupName="fagsaksortering"
                    landkoder={landkoder}
                  />
                )}
                {sokResultat.length === 0 && ingenTreff}
              </>
            )}
          </section>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
}

export default Sok;
