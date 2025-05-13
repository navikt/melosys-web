import { connect, ConnectedProps } from "react-redux";

import { RootState } from "AppTypes";

import * as Nav from "../../../../navFrontend";
import JournalforingOppgave from "../../../../felleskomponenter/oppgaveliste/journalforingOppgave";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";

import "./journalforingsppgaver.css";

const mapStateToProps = (state: RootState) => ({
  mineSaker: oppgaverSelectors.MineSakerSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

/**
 * Lister ut journalføringsoppgaver som saksbehandleren har opprettet
 */
export function JournalforingsOppgaver({ mineSaker }: PropsFromRedux) {
  const { journalforing } = mineSaker as { journalforing: any[] };

  const ingenSakerMelding = (
    <Nav.Alert variant="info" className="mineOppgaver__alarm">
      Det er ingen journalføringsoppgaver på arbeidsbenken din
    </Nav.Alert>
  );

  return (
    <div className="journalforingsOppgaver">
      <SorterbarListe
        elementer={journalforing}
        component={JournalforingOppgave}
        defaultChecked="ascending"
        sortingLegend="Sorter journalføringsoppgaver etter frist:"
        sortingPath="aktivTil"
        radioGroupName="journalforingsoppgaver"
      />
      {journalforing?.length === 0 && ingenSakerMelding}
    </div>
  );
}

export default connector(JournalforingsOppgaver);
