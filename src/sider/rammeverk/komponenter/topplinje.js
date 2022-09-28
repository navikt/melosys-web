import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PT from "prop-types";

import { ReactComponent as NavLogo } from "../../../resources/images/nav.svg";
import * as MPT from "../../../proptypes";
import * as Nav from "../../../navFrontend";

import { saksbehandlerSelectors } from "../../../ducks/saksbehandler";
import { oppgaverOperations } from "../../../ducks/oppgaver";

import "./topplinje.css";

const Topplinje = (props) => {
  const {
    saksbehandler: { navn },
  } = props;

  const tilForsidenHandler = (event) => {
    event.preventDefault();
    const { hentOppgaveOversikt, history } = props;
    const { push } = history;
    hentOppgaveOversikt();
    push("/");
  };

  return (
    <header className="topplinje">
      <a className="skip-link" href="#main-container">
        <Nav.Typo.Systemtittel>Hopp til hovedinnhold</Nav.Typo.Systemtittel>
      </a>
      <div className="topplinje__brand">
        <button onClick={tilForsidenHandler} className="topplinje__brandKnapp" type="button">
          <NavLogo className="brand__logo" alt="To personer på NAV kontor" />
        </button>
        <div className="brand__skillelinje" />
        <div className="brand__tittel">
          <span>Melosys</span>
        </div>
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

const mapStateToProps = (state) => ({
  saksbehandler: saksbehandlerSelectors.SaksbehandlerSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentOppgaveOversikt: () => dispatch(oppgaverOperations.oversikt()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Topplinje));
