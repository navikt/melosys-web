import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import { useFeatureToggle } from "../../../../featuretoggle";
import "./behandlingsoppgaver.css";
import { MELOSYS_FOLKETRYGDEN_MVP, MELOSYS_IKKEYRKESAKTIV_FORENKLETFLYT } from "../../../../featuretoggle/toggleNavn";

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
  const folketrygdenToggle = useFeatureToggle(MELOSYS_FOLKETRYGDEN_MVP);
  const ikkeYrkesaktivFlytToggle = useFeatureToggle(MELOSYS_IKKEYRKESAKTIV_FORENKLETFLYT);

  const { saksbehandling } = mineSaker as any;

  return (
    <div className="behandlingsOppgaver">
      <SorterbarListe
        elementer={saksbehandling}
        component={BehandlingOppgave}
        defaultChecked="nyeste"
        sortingLegend="Sorter behandlinger etter frist:"
        sortingPath="behandling.registrertDato"
        radioGroupName="behandlingsortering"
        folketrygdenToggleEnabled={folketrygdenToggle}
        ikkeYrkesaktivFlytToggleEnabled={ikkeYrkesaktivFlytToggle}
        landkoder={landkoder}
      />
    </div>
  );
};

export default connector(BehandlingOppgaver);
