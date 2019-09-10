import React, { useState, Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import * as Oppgaver from '../../../ducks/oppgaver';
import * as MPT from '../../../proptypes';
import * as Utils from '../../../utils';
import * as Nav from '../../../utils/navFrontend';

import BehandlingOppgave from '../../../felleskomponenter/oppgaveliste/behandlingOppgave';
import JournalforingOppgave from '../../../felleskomponenter/oppgaveliste/journalforingOppgave';
import withErrorHandling from '../../../felleskomponenter/withErrorHandling';

import './mineoppgaver.css';

const uuid = require('uuid/v4');

const sortBehandlinger = order => (forsteOppgave, andreOppgave) => {
  const { behandling: { registrertDato: forsteRegistrertDato } } = forsteOppgave;
  const { behandling: { registrertDato: andreRegistrertDato } } = andreOppgave;

  const datoDiff = Utils.dato.datoDiffPure(forsteRegistrertDato, andreRegistrertDato, 'seconds');
  return order === 'descending' ? -datoDiff : datoDiff;
};

const Saksbehandlinger = ({ saksbehandlinger }) => {
  const [sortOrder, setSortOrder] = useState('descending');

  const handleSortOrderChange = event => {
    setSortOrder(event.target.value);
  };

  return (
    <Fragment>
      <Nav.Fieldset className="sorteringRadiogruppe" onChange={handleSortOrderChange} legend="Sorter behandlinger etter opprettelsesdato:">
        <div>
          <Nav.Radio
            name="behandlingsortering"
            label="Nyeste først"
            value="descending"
            defaultChecked
          />
          <Nav.Radio
            name="behandlingsortering"
            label="Eldste først"
            value="ascending"
          />
        </div>
      </Nav.Fieldset>
      {saksbehandlinger && saksbehandlinger.slice().sort(sortBehandlinger(sortOrder)).map(oppgave => <BehandlingOppgave key={uuid()} sak={oppgave} />)}
    </Fragment>
  );
};

Saksbehandlinger.propTypes = {
  saksbehandlinger: PT.arrayOf(MPT.SaksbehandlingOppgave),
};

Saksbehandlinger.defaultProps = {
  saksbehandlinger: [],
};

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
      <h1>Mine oppgaver ({antall()})</h1>
      {journalforing && journalforing.map(oppgave => <JournalforingOppgave key={uuid()} sak={oppgave} />)}
      <Saksbehandlinger saksbehandlinger={saksbehandling} />
      {antall() === 0 && ingenSakerMelding}
    </div>
  );
};

MineOppgaver.propTypes = {
  hentOppgaveOversikt: PT.func.isRequired,
  minesaker: MPT.MineOppgaver,
};

MineOppgaver.defaultProps = {
  minesaker: {},
};

const mapStateToProps = state => ({
  minesaker: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentOppgaveOversikt: () => dispatch(Oppgaver.oppgaverOperations.oversikt()),
});
const kontekster = [
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];
export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(MineOppgaver));

export { sortBehandlinger };
