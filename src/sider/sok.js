import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Container, Row, Column } from 'nav-frontend-grid';
import './sok.css';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import { hentNyesaker, NyesakerSelector } from '../ducks/nyesaker';

const uuid = require('uuid/v4');

class Sok extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
  }

  update(value) {
    this.props.hentNyesaker(value.fnr);
  }

  render() {
    const { nyesaker } = this.props;

    return (
      <div className="sok">
        <Container>
          <Row>
            <Column xs="7">
              <h1>Søk</h1>
              <SokeForm onSubmit={this.update} />
              <ul>
                {nyesaker && nyesaker.map(item => <li key={uuid()}><Link to={`saksbehandling/${item.fnr}`}>{item.sammensattNavn}</Link></li>)}
              </ul>
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

export default connect(mapStateToProps, mapDispatchToProps)(Sok);
