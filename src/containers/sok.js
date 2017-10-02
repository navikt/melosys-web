import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';


import {Input} from 'nav-frontend-skjema';
import {Hovedknapp} from 'nav-frontend-knapper';
import {Container, Row, Column} from 'nav-frontend-grid';

import SokeForm from '../moduler/arbeidsforhold/soke-form';

import './sok.less';

class Sok extends Component {
    constructor(props) {
        super(props);
    }

    submit = (values) => {
        this.props.history.push('/saksbehandling/'+values.fnr);
    };

    render() {
        return (
            <Container>
                <Row>
                    <Column xs={"7"}>
                        <div className="Sok">
                            <h1>Velkommen til Melosys</h1>
                            <SokeForm onSubmit={this.submit} />
                        </div>
                    </Column>
                    <Column xs={"5"}>
                        <h1>Saker under behandling</h1>
                        <h1>Tidligere behandlede saker</h1>
                    </Column>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    return ({})
};

const mapDispatchToProps = (dispatch) => ({});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok));

