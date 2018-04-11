import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as Oppgaver from '../../ducks/oppgaver';
import * as MPT from '../../proptypes/';
import * as Nav from '../../utils/navFrontend';
import * as Ikoner from '../../resources/images';

import SakEnkeltLinje from './saksliste/sakEnkeltLinje';
import PanelHeader from '../../felles-komponenter/panelHeader/panelHeader';

import './minesaker.css';

const uuid = require('uuid/v4');

const MinJournalForingLinje = ({ sak }) => {
  const { journalPostID, aktivTil } = sak;
  const tittel = 'Journalføring';
  const link = `/journalforing/${journalPostID}`;

  const undertittel = () => (
    <Nav.Row>
      <Nav.Column xs="12" md="6">
        <dl className="minsak__meta">
          <dt className="minsak__meta__term">Frist:</dt>
          <dd className="minsak__meta__detalj">{aktivTil}</dd>
        </dl>
      </Nav.Column>
    </Nav.Row>
  );

  return (
    <Link to={link} className="minsak__link">
      <Nav.Panel className="minsak">
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={undertittel()} />
      </Nav.Panel>
    </Link>
  );
};
MinJournalForingLinje.propTypes = {
  sak: PT.shape({
    oppgavetype: PT.string.isRequired,
    journalPostID: PT.string.isRequired,
  }),
};
MinJournalForingLinje.defaultProps = {
  sak: {},
};


const OppgaveVelger = ({ oppgave }) => {
  const { oppgavetype } = oppgave;
  if (oppgavetype === 'behandling') {
    return (
      <SakEnkeltLinje sak={oppgave} />
    );
  } else if (oppgavetype === 'journalforing') {
    return (
      <MinJournalForingLinje sak={oppgave} />
    );
  }
  return (
    <p>Hei Are</p>
  );
};
OppgaveVelger.propTypes = {
  oppgave: PT.object,
};
OppgaveVelger.defaultProps = {
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
    const ingenSakerMelding = 'Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra listen til høyre.';

    return (
      <div className="minesaker">
        <h1>Mine Oppgaver ({minesaker.length})</h1>
        {minesaker && minesaker.length && minesaker.map(sak => <OppgaveVelger key={uuid()} oppgave={sak} />)}
        {minesaker.length === 0 && ingenSakerMelding}
      </div>
    );
  }
}

MineSaker.propTypes = {
  hentMineSaker: PT.func.isRequired,
  minesaker: MPT.MineSaker,
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
