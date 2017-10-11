import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Container, Row, Column } from 'nav-frontend-grid';
import './sok.css';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import { hentNyesaker, NyesakerSelector } from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles'
import { TidligeresakerSelector } from '../ducks/tidligeresaker'

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
    const { nyesaker, sakerbehandles, tidligeresaker } = this.props;

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
              <h1>Saker under behandling</h1>
              {sakerbehandles && sakerbehandles.map(item => <li key={uuid()}><Link to={`saksbehandling/${item.fnr}`}>{item.sammensattNavn}</Link></li>)}
              <h1>Tidlgere behandlede saker</h1>
              {tidligeresaker && tidligeresaker.map(item => <li key={uuid()}><Link to={`saksbehandling/${item.fnr}`}>{item.sammensattNavn}</Link></li>)}
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
  tidligeresaker: PT.func.isRequired,
  sakerbehandler: PT.func.isRequired,
};

const mapStateToProps = state => ({
  nyesaker: NyesakerSelector(state),
  sakerbehandles: SakerbehandlesSelector(state),
  tidligeresaker: TidligeresakerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentNyesaker: fnr => dispatch(hentNyesaker(fnr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sok);
