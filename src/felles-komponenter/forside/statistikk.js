import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as Nav from '../../utils/navFrontend';
import * as Oppgaver from '../../ducks/oppgaver';

const Statistikk = props => {
  const { antallSaker } = props;
  return (
    <Nav.Panel className="forside__sidepanel">
      <Nav.Undertittel>Statistikk</Nav.Undertittel>
      <h3>Mine Saker</h3>
      <h1>{antallSaker}</h1>
    </Nav.Panel>
  );
};
Statistikk.propTypes = {
  antallSaker: PT.number.isRequired,
};
const mapStateToProps = state => ({
  antallSaker: Oppgaver.oppgaverSelectors.MineSakerAntallSelector(state),
});

export default connect(mapStateToProps)(Statistikk);
