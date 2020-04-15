import React from 'react';
import { connect } from 'react-redux';

import * as Oppgaver from '../../../../ducks/oppgaver';
import * as MPT from '../../../../proptypes';

import BehandlingOppgave from '../../../../felleskomponenter/oppgaveliste/behandlingOppgave';
import withErrorHandling from '../../../../felleskomponenter/withErrorHandling';
import JournalforingOppgave from '../../../../felleskomponenter/oppgaveliste/journalforingOppgave';
import OppgaverMedSortering from './oppgaver';

/**
 * Mine saker lister ut alle saker som saksbehandleren jobber med akkurat nå.
 */
export const MineOppgaver = props => {
  const { minesaker } = props;
  const { journalforing, saksbehandling } = minesaker;
  const antall = () => {
    const jf = journalforing ? journalforing.length : 0;
    const sb = saksbehandling ? saksbehandling.length : 0;
    return jf + sb;
  };
  const ingenSakerMelding = 'Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.';

  return (
    <div className="minesaker">
      <h1>Mine oppgaver ({antall()})</h1>
      <OppgaverMedSortering
        oppgaver={journalforing}
        component={JournalforingOppgave}
        defaultChecked="eldste"
        sortingLegend="Sorter journalføringsoppgaver etter frist:"
        sortingPath="aktivTil"
      />
      <OppgaverMedSortering
        oppgaver={saksbehandling}
        component={BehandlingOppgave}
        defaultChecked="nyeste"
        sortingLegend="Sorter behandlinger etter opprettelsesdato:"
        sortingPath="behandling.registrertDato"
        radioGroupName="behandlingsortering"
      />
      {antall() === 0 && ingenSakerMelding}
    </div>
  );
};

MineOppgaver.propTypes = {
  minesaker: MPT.MineOppgaver,
};

MineOppgaver.defaultProps = {
  minesaker: {},
};

const mapStateToProps = state => ({
  minesaker: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
});

const kontekster = [
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];

export default withErrorHandling(kontekster, connect(mapStateToProps)(MineOppgaver));
