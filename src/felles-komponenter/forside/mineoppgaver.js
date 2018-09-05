import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Oppgaver from '../../ducks/oppgaver';
import * as MPT from '../../proptypes/';
import SakEnkeltLinje from './oppgaveliste/sakEnkeltLinje';
import JournalForingEnkeltLinje from './oppgaveliste/journalForingEnkeltLinje';

import './mineoppgaver.css';
import withErrorHandling from '../../hoc/withErrorHandling';
import { KodeverkSelectors } from '../../ducks/kodeverk';

/**
 * Mine saker lister ut alle saker som saksbehandleren jobber med akkurat nå.
 */
const MineOppgaver = props => {
  const { minesaker, sakstypeKoder } = props;
  const { journalforing, saksbehandling } = minesaker;
  const sum = () => {
    const j = journalforing ? journalforing.length : 0;
    const s = saksbehandling ? saksbehandling.length : 0;
    return j + s;
  };
  const ingenSakerMelding = 'Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.';
  return (
    <div className="minesaker">
      <h1>Mine Oppgaver ({sum()})</h1>
      {journalforing && journalforing.map(oppgave => <JournalForingEnkeltLinje sak={oppgave} />)}

      {saksbehandling && saksbehandling.map(oppgave => <SakEnkeltLinje sak={oppgave} />)}
      {sum() === 0 && ingenSakerMelding}
    </div>
  );
};

MineOppgaver.propTypes = {
  hentMineSaker: PT.func.isRequired,
  minesaker: MPT.MineOppgaver,
  sakstypeKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

MineOppgaver.defaultProps = {
  minesaker: [],
};

const mapStateToProps = state => ({
  minesaker: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
  sakstypeKoder: KodeverkSelectors.sakstyperSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentMineSaker: () => dispatch(Oppgaver.oppgaverOperations.hent()),
});
const kontekster = [
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];
export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(MineOppgaver));
