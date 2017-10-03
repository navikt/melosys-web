import React, {Component} from 'react';
import {connect} from 'react-redux';

import './vilkarsvurdering.css';


class Vilkarsvurdering extends Component {

    render() {
        return (
            <div className="Vilkarsvurdering">

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

export default connect(mapStateToProps, mapDispatchToProps)(Vilkarsvurdering);