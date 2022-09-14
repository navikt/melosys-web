import React from "react";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "AppTypes";

import withErrorHandling from "../../../../felleskomponenter/withErrorHandling";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import "./mineoppgaver.css";
import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import { useFeatureToggle } from "../../../../featuretoggle";

const mapStateToProps = (state: RootState) => ({
  mineSaker: oppgaverSelectors.MineSakerSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

/**
 * Lister ut journalføringsoppgaver som saksbehandleren har opprettet
 */
export const BehandlingOppgaver = ({ mineSaker, landkoder }: PropsFromRedux) => {
  const sakstemaToggle = useFeatureToggle("melosys.sakstema");
  const { saksbehandling } = mineSaker;

  return (
    <div className="mineOppgaver">
      <SorterbarListe
        elementer={saksbehandling}
        component={BehandlingOppgave}
        defaultChecked="nyeste"
        sortingLegend="Sorter behandlinger etter opprettelsesdato:"
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
