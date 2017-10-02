import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { hentSaksbehandler, getSaksbehandlerState } from '../ducks/saksbehandler';
import * as navLogo from '../resources/images/nav.svg';
import * as saksbehandlerIkon from '../resources/images/saksbehandler.svg';
import '../index.css'
import './topplinje.css'

class Topplinje extends Component {
  componentDidMount() {
    this.props.hentSaksbehandler()
  }

  render() {
    const {saksbehandler: {navn}} = this.props;
    return (
        <header className="headerContainer">
          <div className="topplinje">
            <div>
              <div className="logo">
                <Link to="/" alt="NAV, lenke hovedsiden">
                  <img
                      className="headerIkon"
                      src={navLogo}
                      alt="To personer på NAV kontor"
                  />
                </Link>
              </div>
              <div className="headerDivider" />
            </div>
            <h4 className="text"><span>Medlemsskap og lovvalgssystem</span></h4>
            <div className="saksbehandler">
              <img className="saksbehandlerIkon" src={saksbehandlerIkon} alt="Saksbehandler" />
              <div className="saksbehandlerTekst">{navn}</div>
            </div>
          </div>
        </header>
    );
  }
}

const mapStateToProps = (state) => {
  return ({
    saksbehandler: getSaksbehandlerState(state)
  })
};
const mapDispatchToProps = (dispatch) => ({
  hentSaksbehandler: () => dispatch(hentSaksbehandler())
});

export default connect(mapStateToProps, mapDispatchToProps)(Topplinje);