import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as navLogo from '../resources/images/nav.svg';

import './topplinje.css';
import * as MPT from '../proptypes';

import {
  hentSaksbehandler,
  SaksbehandlerSelector,
} from '../ducks/saksbehandler';

class Topplinje extends Component {
  static propTypes = {
    hentSaksbehandler: PT.func.isRequired,
    saksbehandler: MPT.SaksbehandlerPropType.isRequired,
  };
  static defaultProps = {
    saksbehandler: {
      navn: '',
    },
  };
  componentDidMount() {
    this.props.hentSaksbehandler();
  }

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
        <div className="topplinje__sok">
          <input className="sok__felt" />
          <button className="sok__button" />
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

const mapDispatchToProps = dispatch => ({
  hentSaksbehandler: () => dispatch(hentSaksbehandler()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Topplinje);
