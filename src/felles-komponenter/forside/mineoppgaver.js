import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Oppgaver from '../../ducks/oppgaver';
import * as MPT from '../../proptypes/';
import BehandlingOppgave from './oppgaveliste/behandlingOppgave';
import JournalforingOppgave from './oppgaveliste/journalforingOppgave';

import './mineoppgaver.css';
import withErrorHandling from '../../hoc/withErrorHandling';

const uuid = require('uuid/v4');
/**
 * Mine saker lister ut alle saker som saksbehandleren jobber med akkurat nå.
 */
const MineOppgaver = props => {
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
      <h1>Mine Oppgaver ({antall()})</h1>
      {journalforing && journalforing.map(oppgave => <JournalforingOppgave key={uuid()} sak={oppgave} />)}

      {saksbehandling && saksbehandling.map(oppgave => <BehandlingOppgave key={uuid()} sak={oppgave} />)}
      {antall() === 0 && ingenSakerMelding}
    </div>
  );
};

MineOppgaver.propTypes = {
  hentMineSaker: PT.func.isRequired,
  minesaker: MPT.MineOppgaver,
};

MineOppgaver.defaultProps = {
  minesaker: {},
};

const mapStateToProps = state => ({
  minesaker: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentMineSaker: () => dispatch(Oppgaver.oppgaverOperations.hent()),
});
const kontekster = [
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];
export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(MineOppgaver));
