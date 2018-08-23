import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Oppgaver from '../../ducks/oppgaver';

import SakEnkeltLinje from './oppgaveliste/sakEnkeltLinje';
import JournalForingEnkeltLinje from './oppgaveliste/journalForingEnkeltLinje';

import './mineoppgaver.css';
import withErrorHandling from '../../hoc/withErrorHandling';

const uuid = require('uuid/v4');

/** Siden vi har mer enn én oppgavetype trenger vi en slags "kontroller"-komponent som
 * kan hente inn riktig komponent av hengig av oppgavetype. Dette gjør at vi får små,
 * og spesialiserte komponenter i listen fremfor én stor komponent som skal gjøre alt.
 * @param oppgave {object} Objektet for den aktuelle oppgaven.
 */
const OppgaveKomponentSwitch = ({ oppgave }) => {
  const { oppgavetype = {} } = oppgave;

  switch (oppgavetype.kode) {
    case 'BEH_SAK': {
      return (
        <SakEnkeltLinje sak={oppgave} />
      );
    }
    case 'JFR': {
      return (
        <JournalForingEnkeltLinje sak={oppgave} />
      );
    }
    default: {
      return (<div>Ukjent oppgavetype</div>);
    }
  }
};

OppgaveKomponentSwitch.propTypes = {
  oppgave: PT.object,
};

OppgaveKomponentSwitch.defaultProps = {
  oppgave: {},
};

/**
 * Mine saker lister ut alle saker som saksbehandleren jobber med akkurat nå.
 */
const MineOppgaver = () => {
  const { minesaker } = this.props;
  const ingenSakerMelding = 'Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.';

  return (
    <div className="minesaker">
      <h1>Mine Oppgaver ({minesaker.length})</h1>
      {minesaker.map(sak => <OppgaveKomponentSwitch key={uuid()} oppgave={sak} />)}
      {minesaker.length === 0 && ingenSakerMelding}
    </div>
  );
};

MineOppgaver.propTypes = {
  hentMineSaker: PT.func.isRequired,
  minesaker: PT.array,
};

MineOppgaver.defaultProps = {
  minesaker: [],
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
