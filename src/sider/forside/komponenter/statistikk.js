import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import * as Nav from '../../../utils/navFrontend';
import { oppgaverSelectors } from '../../../ducks/oppgaver';

import './statistikk.css';

const Statistikk = props => {
  const { antallSaker, antallJournalforing, antallSoknader } = props;
  return (
    <Nav.Panel className="forside__sidepanel statistikk">
      <div>
        <dl className="statistikk__meta">
          <dt className="statistikk__meta__term">Mine saker</dt>
          <dd className="statistikk__meta__detalj">{antallSaker}</dd>
        </dl>
      </div>
      <div>
        <dl className="statistikk__meta">
          <dt className="statistikk__meta__term">Journalføring med <br />frist i dag</dt>
          <dd className="statistikk__meta__detalj">{antallSoknader}</dd>
        </dl>
      </div>
      <div>
        <dl className="statistikk__meta">
          <dt className="statistikk__meta__term">Søknader med <br />frist i dag</dt>
          <dd className="statistikk__meta__detalj">{antallJournalforing}</dd>
        </dl>
      </div>
    </Nav.Panel>
  );
};

Statistikk.propTypes = {
  antallSaker: PT.number,
  antallJournalforing: PT.number,
  antallSoknader: PT.number,
};

Statistikk.defaultProps = {
  antallSaker: 0,
  antallJournalforing: 0,
  antallSoknader: 0,
};

const mapStateToProps = state => ({
  antallSaker: oppgaverSelectors.MineSakerAntallSelector(state),
});

export default connect(mapStateToProps)(Statistikk);
