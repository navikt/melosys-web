import React, {Component} from 'react';
import {connect} from 'react-redux';
import './soknadsinfo.css'

import {Innholdstittel} from 'nav-frontend-typografi';

class Soknadsinfo extends Component {

    render() {
        return (
            <div className="Soknadsinfo">
                <Innholdstittel className="blokk-xs">Søknad om A1</Innholdstittel>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return ({
    })
};
const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Soknadsinfo);