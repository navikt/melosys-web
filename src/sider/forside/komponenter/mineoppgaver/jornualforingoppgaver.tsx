import React from "react";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "AppTypes";

import * as Nav from "../../../../navFrontend";

import withErrorHandling from "../../../../felleskomponenter/withErrorHandling";
import JournalforingOppgave from "../../../../felleskomponenter/oppgaveliste/journalforingOppgave";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";

import "./mineoppgaver.css";

const mapStateToProps = (state: RootState) => ({
  mineSaker: oppgaverSelectors.MineSakerSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

/**
 * Lister ut journalføringsoppgaver som saksbehandleren har opprettet
 */
export const JournalforingsOppgaver = ({ mineSaker }: PropsFromRedux) => {
  const { journalforing } = mineSaker;

  const ingenSakerMelding = (
    <Nav.AlertStripeInfo className="mineOppgaver__alarm">
      Det er ingen journalføringsoppgaver på arbeidsbenken din
    </Nav.AlertStripeInfo>
  );

  return (
    <div className="mineOppgaver">
      <SorterbarListe
        elementer={journalforing}
        component={JournalforingOppgave}
        defaultChecked="eldste"
        sortingLegend="Sorter journalføringsoppgaver etter frist:"
        sortingPath="aktivTil"
        radioGroupName="journalforingsoppgaver"
      />
      {journalforing?.length === 0 && ingenSakerMelding}
    </div>
  );
};

const kontekster = [{ navn: "oppgaver", melding: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" }];

export default withErrorHandling(kontekster, connector(JournalforingsOppgaver));
