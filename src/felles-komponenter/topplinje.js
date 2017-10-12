import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as navLogo from '../resources/images/nav.svg';

import './topplinje.css';
import * as MPT from '../proptypes';

import {
  SaksbehandlerSelector,
} from '../ducks/saksbehandler';

class Topplinje extends Component {
  static propTypes = {
    saksbehandler: MPT.SaksbehandlerPropType.isRequired,
  };
  static defaultProps = {
    saksbehandler: {
      navn: '',
    },
  };

  render() {
    const { saksbehandler: { navn } } = this.props;
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
          <div className="brand__tittel"><span>Medlemsskap og lovvalgssystem</span></div>
        </div>
        <div className="topplinje__saksbehandler">
          <div className="saksbehandler__navn">{navn}</div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => ({
  saksbehandler: SaksbehandlerSelector(state),
});


export default connect(mapStateToProps)(Topplinje);
