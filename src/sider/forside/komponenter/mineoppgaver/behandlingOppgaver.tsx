import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors } from "../../../../ducks/landkoder";

import { useFeatureToggle } from "../../../../featuretoggle";
import "./behandlingsoppgaver.css";
import {
  MELOSYS_FTRL_IKKE_YRKESAKTIV,
  MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING,
} from "../../../../featuretoggle/toggleNavn";

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
  const manglendeInnbetalingToggleEnabled = useFeatureToggle(MELOSYS_SAKSBEHANDLING_MANGLENDE_INNBETALING);
  const ikkeYrkesaktivFtrlToggleEnabled = useFeatureToggle(MELOSYS_FTRL_IKKE_YRKESAKTIV);

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
        manglendeInnbetalingToggleEnabled={manglendeInnbetalingToggleEnabled}
        ikkeYrkesaktivFtrlToggleEnabled={ikkeYrkesaktivFtrlToggleEnabled}
        landkoder={landkoder}
      />
    </div>
  );
};

export default connector(BehandlingOppgaver);
