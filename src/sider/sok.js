import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Container, Row, Column } from 'nav-frontend-grid';
import './sok.css';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import { hentNyesaker, NyesakerSelector } from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles';
import { TidligeresakerSelector } from '../ducks/tidligeresaker';

const uuid = require('uuid/v4');

const LenkeListe = ({ saker }) => {
  if (!saker) {
    return null;
  }
  const lenker = saker.map(item => {
      const {fnr, sammensattNavn} = item;
      const link = `/saksbehandling/${fnr}`;
      return (
        <li key={uuid()}><Link to={link}>{sammensattNavn}</Link></li>
      )
    }
  );
  return (
    <ul>
      {lenker}
    </ul>
  );
};

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
              <LenkeListe saker={nyesaker}/>
            </Column>
            <Column xs="5">
              <h1>Saker under behandling</h1>
              <LenkeListe saker={sakerbehandles}/>
              <h1>Tidlgere behandlede saker</h1>
              <LenkeListe saker={tidligeresaker}/>
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
  tidligeresaker: PT.array.isRequired,
  sakerbehandles: PT.array.isRequired,
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
