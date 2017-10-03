import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {hentSaksbehandler, getSaksbehandlerState} from '../ducks/saksbehandler';
import * as navLogo from '../resources/images/nav.svg';
import './topplinje.css'

class Topplinje extends Component {
    componentDidMount() {
        this.props.hentSaksbehandler()
    }

    render() {
        const {saksbehandler: {navn}} = this.props;
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
                    <div className="brand__skillelinje"/>
                    <h4 className="brand__tittel">Melosys</h4>
                </div>
                <div className="topplinje__sok">
                    <input type="text" className="sok__felt" />
                    <button className="sok__button"></button>
                </div>
                <div className="topplinje__bruker">
                    <div className="bruker__navn">{navn}</div>
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