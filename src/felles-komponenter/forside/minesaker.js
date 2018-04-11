import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Oppgaver from '../../ducks/oppgaver';

import SakEnkeltLinje from './oppgaveliste/sakEnkeltLinje';
import JournalForingEnkeltLinje from './oppgaveliste/journalForingEnkeltLinje';

import './minesaker.css';

const uuid = require('uuid/v4');

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
class MineSaker extends Component {
  componentDidMount() {
    this.props.hentMineSaker();
  }

  render() {
    const { minesaker } = this.props;
    const ingenSakerMelding = 'Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.';

    return (
      <div className="minesaker">
        <h1>Mine Oppgaver ({minesaker.length})</h1>
        {minesaker && minesaker.length && minesaker.map(sak => <OppgaveKomponentSwitch key={uuid()} oppgave={sak} />)}
        {minesaker.length === 0 && ingenSakerMelding}
      </div>
    );
  }
}

MineSaker.propTypes = {
  hentMineSaker: PT.func.isRequired,
  minesaker: PT.array,
};

MineSaker.defaultProps = {
  minesaker: [],
};

const mapStateToProps = state => ({
  minesaker: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentMineSaker: () => dispatch(Oppgaver.oppgaverOperations.hentMineSaker()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MineSaker);
