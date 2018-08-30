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

const uuid = require('uuid/v4');

/** Siden vi har mer enn én oppgavetype trenger vi en slags "kontroller"-komponent som
 * kan hente inn riktig komponent av hengig av oppgavetype. Dette gjør at vi får små,
 * og spesialiserte komponenter i listen fremfor én stor komponent som skal gjøre alt.
 * @param oppgave {object} Objektet for den aktuelle oppgaven.
 */
const OppgaveKomponentSwitch = ({ oppgave }) => {
  const { oppgavetypeKode } = oppgave;

  switch (oppgavetypeKode) {
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
  oppgave: MPT.SakEnkeltLinje,
};

OppgaveKomponentSwitch.defaultProps = {
  oppgave: {},
};

/**
 * Mine saker lister ut alle saker som saksbehandleren jobber med akkurat nå.
 */
const MineOppgaver = props => {
  const { minesaker, sakstypeKoder } = props;
  const ingenSakerMelding = 'Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.';
  return (
    <div className="minesaker">
      <h1>Mine Oppgaver ({minesaker.length})</h1>
      {minesaker.map(sak => {
        const sakstype = sakstypeKoder.find(item => item.kode === sak.sakstypeKode);
        const oppgave = {
          sakstype,
          ...sak,
        };
        return (<OppgaveKomponentSwitch key={uuid()} oppgave={oppgave} />);
      })}
      {minesaker.length === 0 && ingenSakerMelding}
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
