import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as navLogo from '../resources/images/nav.svg';

import './topplinje.css';
import * as MPT from '../proptypes/';

import { saksbehandlerSelectors } from '../ducks/saksbehandler/';
import { fagsakOperations } from '../ducks/fagsaker/';
import { vilkarOperations } from '../ducks/vilkar/';
import { avklartefaktaOperations } from '../ducks/avklartefakta/';
import { lovvalgsperioderOperations } from '../ducks/lovvalgsperioder/';
import { soknadOperations } from '../ducks/soknad/';
import { oppgaverOperations } from '../ducks/oppgaver/';

const Topplinje = props => {
  const { saksbehandler: { navn } } = props;

  const tilForsidenHandler = event => {
    event.preventDefault();
    const { hentOppgaver, history } = props;
    const { push } = history;

    /* eslint no-alert: off */
    if (window.confirm('Noen endringer vil kanskje ikke bli lagret. Vil du fortsette?')) {
      hentOppgaver();
      push('/');
    }
  };

  return (
    <header className="topplinje">
      <div className="topplinje__brand">
        <button onClick={tilForsidenHandler} className="topplinje__brandKnapp">
          <img
            className="brand__logo"
            src={navLogo}
            alt="To personer på NAV kontor"
          />
        </button>
        <div className="brand__skillelinje" />
        <div className="brand__tittel"><span>Melosys</span></div>
      </div>
      <div className="topplinje__saksbehandler">
        <div className="saksbehandler__navn">{navn}</div>
      </div>
    </header>
  );
};

Topplinje.propTypes = {
  saksbehandler: MPT.Saksbehandler.isRequired,
  history: PT.object.isRequired,
  hentOppgaver: PT.func.isRequired,
};

const mapStateToProps = state => ({
  saksbehandler: saksbehandlerSelectors.SaksbehandlerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  resetVilkarState: () => dispatch(vilkarOperations.resetVilkarState()),
  resetAvklartefaktaState: () => dispatch(avklartefaktaOperations.resetAvklartefaktaState()),
  resetSoknadState: () => dispatch(soknadOperations.resetSoknadState()),
  resetLovvalgsperiode: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  hentOppgaver: () => dispatch(oppgaverOperations.hent()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Topplinje));
