import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import withErrorHandling from "../../../../felleskomponenter/withErrorHandling";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import { useFeatureToggle } from "../../../../featuretoggle";
import "./behandlingsoppgaver.css";

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
  const folketrygdenToggle = useFeatureToggle("melosys.folketrygden.mvp");
  const ikkeYrkesaktivFlytToggle = useFeatureToggle("melosys.ikkeYrkesaktivForenkletFlyt");
  const registreringUnntakFraMedlemskapToggle = useFeatureToggle("melosys.registrering_unntak_fra_medlemskap");

  const { saksbehandling } = mineSaker;

  return (
    <div className="behandlingsOppgaver">
      <SorterbarListe
        elementer={saksbehandling}
        component={BehandlingOppgave}
        defaultChecked="nyeste"
        sortingLegend="Sorter behandlinger etter frist:"
        sortingPath="behandling.registrertDato"
        radioGroupName="behandlingsortering"
        folketrygdenToggleEnabled={folketrygdenToggle === "enabled"}
        ikkeYrkesaktivFlytToggleEnabled={ikkeYrkesaktivFlytToggle === "enabled"}
        registreringUnntakFraMedlemskapToggleEnabled={registreringUnntakFraMedlemskapToggle === "enabled"}
        landkoder={landkoder}
      />
    </div>
  );
};

const kontekster = [{ navn: "oppgaver", melding: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" }];

export default withErrorHandling(kontekster, connector(BehandlingOppgaver));
