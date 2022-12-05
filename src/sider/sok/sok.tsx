import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import withErrorHandling from "../../felleskomponenter/withErrorHandling";
import Fagsak from "../../felleskomponenter/oppgaveliste/fagsak";
import SorterbarListe from "../../felleskomponenter/sorterbarListe";
import { landkoderOperations, landkoderSelectors } from "../../ducks/landkoder";
import { sokSelectors, sokOperations } from "../../ducks/sok";
import { useFeatureToggle } from "../../featuretoggle";

import "./sok.css";

const mapStateToProps = (state: RootState) => ({
  sokResultat: sokSelectors.FagsakSokSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  sok: (sokefrase: string) => dispatch(sokOperations.sok(sokefrase)),
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export type SokProps = PropsFromRedux & {
  children?: JSX.Element;
};

export const Sok = ({ sokResultat, children, sok, hentLandkoder, landkoder }: SokProps) => {
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const sokefrase = sessionStorage.getItem("sokefrase");

  useEffect(() => {
    if (sokefrase) {
      sok(sokefrase);
    }
    hentLandkoder();

    return () => {
      sessionStorage.removeItem("sokefrase");
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

  const ingenTreff = <Nav.Panel>Fant ingen saker knyttet til {enhet(sokefrase)}.</Nav.Panel>;

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
            {sokResultat.length > 0 && (
              <SorterbarListe
                elementer={sokResultat}
                component={Fagsak}
                defaultChecked="nyeste"
                sortingLegend="Sorter fagsaker etter opprettelsesdato:"
                sortingPath="opprettetDato"
                radioGroupName="fagsaksortering"
                visSakstema={behandleAlleSakerToggle === "enabled"}
                landkoder={landkoder}
              />
            )}
            {sokResultat.length === 0 && ingenTreff}
          </section>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

const kontekster = [
  { navn: "fagsaker", melding: "Det har oppstått en feil: Kunne ikke hente fagsaker" },
  { navn: "oppgaver", melding: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" },
];

export default withErrorHandling(kontekster, connector(Sok));
