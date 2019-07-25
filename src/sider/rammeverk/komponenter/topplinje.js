import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as navLogo from '../../../resources/images/nav.svg';
import * as MPT from '../../../proptypes/';
import * as Utils from '../../../utils/utils';

import { saksbehandlerSelectors } from '../../../ducks/saksbehandler/';
import { fagsakOperations } from '../../../ducks/fagsaker/';
import { vilkarOperations } from '../../../ducks/vilkar/';
import { avklartefaktaOperations } from '../../../ducks/avklartefakta/';
import { lovvalgsperioderOperations } from '../../../ducks/lovvalgsperioder/';
import { soknadOperations } from '../../../ducks/soknad/';
import { oppgaverOperations } from '../../../ducks/oppgaver/';

import './topplinje.css';

const Topplinje = props => {
  const { saksbehandler: { navn } } = props;

  const tilForsidenHandler = event => {
    event.preventDefault();
    const { hentOppgaveOversikt, history } = props;
    const { push } = history;
    const { byggVersjon } = Utils.buildinfo();
    if (byggVersjon === 'local') {
      hentOppgaveOversikt();
      push('/');
      return;
    }
    /* eslint no-alert: off */
    if (window.confirm('Noen endringer vil kanskje ikke bli lagret. Vil du fortsette?')) {
      hentOppgaveOversikt();
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
  hentOppgaveOversikt: PT.func.isRequired,
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
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Topplinje));
