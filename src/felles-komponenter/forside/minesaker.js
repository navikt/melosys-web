import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import * as Oppgaver from '../../ducks/oppgaver';
import * as MPT from '../../proptypes/';

import SakEnkeltLinje from './saksliste/sakEnkeltLinje';

import './minesaker.css';

const uuid = require('uuid/v4');

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
        <h1>Mine Saker ({minesaker.length})</h1>
        {minesaker && minesaker.map(sak => <SakEnkeltLinje key={uuid()} sak={sak} />)}
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
