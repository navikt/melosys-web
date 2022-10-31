import React, { useEffect } from "react";
import { connect, ConnectedProps, useDispatch } from "react-redux";

import { RootState } from "AppTypes";

import withErrorHandling from "../../../../felleskomponenter/withErrorHandling";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import "./behandlingsoppgaver.css";
import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import { useFeatureToggle } from "../../../../featuretoggle";
import { oversikt } from "../../../../ducks/oppgaver/operations";

const mapStateToProps = (state: RootState) => ({
  mineSaker: oppgaverSelectors.MineSakerSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

/**
 * Lister ut behandlingsoppgaver som saksbehandleren har opprettet
 */
export const BehandlingOppgaver = ({ mineSaker, landkoder }: PropsFromRedux) => {
  const sakstemaToggle = useFeatureToggle("melosys.sakstema");
  const { saksbehandling } = mineSaker;
  const dispatch = useDispatch();

  const refreshOversiktDelayMillis = 5000;
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(oversikt());
    }, refreshOversiktDelayMillis);
    return () => clearTimeout(timer);
  }, []);

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
