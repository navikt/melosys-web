import React, { useEffect } from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import * as MPT from "../../../../proptypes";

import BehandlingOppgave from "../../../../felleskomponenter/oppgaveliste/behandlingOppgave";
import withErrorHandling from "../../../../felleskomponenter/withErrorHandling";
import JournalforingOppgave from "../../../../felleskomponenter/oppgaveliste/journalforingOppgave";
import SorterbarListe from "../../../../felleskomponenter/sorterbarListe";

import { oppgaverSelectors } from "../../../../ducks/oppgaver";
import { landkoderSelectors, landkoderOperations } from "../../../../ducks/landkoder";
import { useFeatureToggle } from "../../../../featuretoggle";

import "./mineoppgaver.css";

/**
 * Mine saker lister ut alle saker som saksbehandleren jobber med akkurat nå.
 */
export const MineOppgaver = (props) => {
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");

  const { mineSaker, landkoder, hentLandkoder } = props;
  const { journalforing, saksbehandling } = mineSaker;

  useEffect(() => {
    hentLandkoder();
  }, []);

  const antall = () => {
    const jf = journalforing ? journalforing.length : 0;
    const sb = saksbehandling ? saksbehandling.length : 0;
    return jf + sb;
  };

  const ingenSakerMelding =
    "Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.";

  return (
    <div className="mineOppgaver">
      <h1>Mine oppgaver ({antall()})</h1>
      <SorterbarListe
        elementer={journalforing}
        component={JournalforingOppgave}
        defaultChecked="eldste"
        sortingLegend="Sorter journalføringsoppgaver etter frist:"
        sortingPath="aktivTil"
      />
      <SorterbarListe
        className="behandlingsoppgaver"
        elementer={saksbehandling}
        component={BehandlingOppgave}
        defaultChecked="nyeste"
        sortingLegend="Sorter behandlinger etter opprettelsesdato:"
        sortingPath="behandling.registrertDato"
        radioGroupName="behandlingsortering"
        visSakstema={behandleAlleSakerToggle === "enabled"}
        landkoder={landkoder}
      />
      {antall() === 0 && ingenSakerMelding}
    </div>
  );
};

MineOppgaver.propTypes = {
  mineSaker: MPT.MineOppgaver,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  hentLandkoder: PT.func.isRequired,
};

MineOppgaver.defaultProps = {
  mineSaker: {},
};

const mapStateToProps = (state) => ({
  mineSaker: oppgaverSelectors.MineSakerSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentLandkoder: () => dispatch(landkoderOperations.hentLandkoder()),
});

const kontekster = [{ navn: "oppgaver", melding: "Det har oppstått en feil: Kunne ikke søke etter oppgaver" }];

export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(MineOppgaver));
