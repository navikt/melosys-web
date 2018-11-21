import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as navLogo from '../resources/images/nav.svg';

import './topplinje.css';
import * as MPT from '../proptypes/';

import { saksbehandlerSelectors } from '../ducks/saksbehandler/';

const Topplinje = props => {
  const { saksbehandler: { navn } } = props;
  return (
    <header className="topplinje">
      <div className="topplinje__brand">
        <Link to="/" alt="NAV, lenke hovedsiden">
          <img
            className="brand__logo"
            src={navLogo}
            alt="To personer på NAV kontor"
          />
        </Link>
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
};

const mapStateToProps = state => ({
  saksbehandler: saksbehandlerSelectors.SaksbehandlerSelector(state),
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Topplinje);
