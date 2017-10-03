import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import {
    hentSaksbehandler,
    getSaksbehandlerState,
} from './ducks/saksbehandler';

import Header from './components/Header';

class Topplinje extends Component {
    componentDidMount() {
        this.props.hentSaksbehandler();
    }

    render() {
        const { saksbehandler: { navn } } = this.props;
        return <Header saksbehandlerName={navn} />;
    }
}

Topplinje.propTypes = {
  hentSaksbehandler: PT.func.isRequired,
  saksbehandler: PT.object.isRequired,
};

const mapStateToProps = state => ({
  saksbehandler: getSaksbehandlerState(state),
});

const mapDispatchToProps = dispatch => ({
    hentSaksbehandler: () => dispatch(hentSaksbehandler()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Topplinje);
