import React, { useEffect } from "react";
import { connect, ConnectedProps, useSelector } from "react-redux";

import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import withErrorHandling from "../../../../felleskomponenter/withErrorHandling";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverOperations, oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import "./behandlingsoppgaver.css";
import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import { useFeatureToggle } from "../../../../featuretoggle";

const mapStateToProps = (state: RootState) => ({
  mineSaker: oppgaverSelectors.MineSakerSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oversikt: () => dispatch(oppgaverOperations.oversikt()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

/**
 * Lister ut behandlingsoppgaver som saksbehandleren har opprettet
 */
export const BehandlingOppgaver = ({ mineSaker, landkoder, oversikt }: PropsFromRedux) => {
  const sakstemaToggle = useFeatureToggle("melosys.sakstema");
  const { saksbehandling } = mineSaker;

  useEffect(() => {
    const timer = setTimeout(() => oversikt(), 5000);
    console.log(oversikt);
    return () => clearTimeout(timer);
  });

  const test = useSelector(() => store.getState().userNameRecuder.name);

  return (
    <div className="behandlingsOppgaver">
      <SorterbarListe
        elementer={saksbehandling}
        component={BehandlingOppgave}
        defaultChecked="nyeste"
        sortingLegend="Sorter behandlinger etter frist:"
        sortingPath="behandling.registrertDato"
        radioGroupName="behandlingsortering"
        visSakstema={sakstemaToggle === "enabled"}
        landkoder={landkoder}
      />
    </div>
  );
};

const kontekster = [{ navn: "oppgaver", melding: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" }];

export default withErrorHandling(kontekster, connector(BehandlingOppgaver));
