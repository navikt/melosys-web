import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Container, Row, Column } from 'nav-frontend-grid';
import './sok.css';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import { hentNyesaker, NyesakerSelector } from '../ducks/nyesaker';

const uuid = require('uuid/v4');

class Sok extends Component {
  render() {
    const { nyesaker } = this.props;

    return (
      <div className="sok">
        <Container>
          <Row>
            <Column xs="7">
              <h1>Søk</h1>
              <SokeForm onSubmit={values => this.props.hentNyesaker(values.fnr)} />
              {nyesaker.map(item => <Link key={uuid()} to={`saksbehandling/${item.fnr}`}>{item.sammensattNavn}</Link>)}

            </Column>
            <Column xs="5">
              <h1>Siste søknader</h1>
              <h1>Behandlede søknader</h1>
            </Column>
          </Row>
        </Container>
      </div>
    );
  }
}

Sok.propTypes = {
  history: PT.any.isRequired,
  nyesaker: PT.array.isRequired,
  hentNyesaker: PT.func.isRequired,
};

const mapStateToProps = state => ({
  nyesaker: NyesakerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentNyesaker: fnr => dispatch(hentNyesaker(fnr)),
});


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok));
