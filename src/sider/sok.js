import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import SokeForm from '../moduler/arbeidsforhold/soke-form';
import * as Nav from '../utils/navFrontend';
import SokListe from '../felles-komponenter/sok/sokListe';
import SokResultat from '../felles-komponenter/sok/sokResultat';
import { hentNyesaker, NyesakerSelector } from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles';
import { TidligeresakerSelector } from '../ducks/tidligeresaker';

import './sok.css';

class Sok extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
  }

  componentWillMount() {
    this.setState({ brukerHarGjortSok: false });
  }

  update(value) {
    this.setState({ brukerHarGjortSok: true });
    this.props.hentNyesaker(value.fnr);
  }

  render() {
    const { nyesaker, sakerbehandles, tidligeresaker } = this.props;
    const visSokefelt = !this.state.brukerHarGjortSok;
    const visResultat = this.state.brukerHarGjortSok;

    return (
      <div className="sok">
        <Nav.Container>
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Innholdstittel id="soke">Velkommen til Melosys</Nav.Innholdstittel>
              {visSokefelt && <SokeForm onSubmit={this.update} /> }
              {visResultat && <SokResultat saker={nyesaker} aria-describedby="something" /> }
            </Nav.Column>
            <Nav.Column xs="5">
              <Nav.Innholdstittel id="overskriftUnderbehandling">Saker under behandling</Nav.Innholdstittel>
              <SokListe saker={sakerbehandles} kanViseFlereSaker aria-describedby="overskriftUnderbehandling" />
              <Nav.Innholdstittel id="overskriftTitligeresaker">Tidligere behandlede saker</Nav.Innholdstittel>
              <SokListe saker={tidligeresaker} kanViseFlereSaker aria-describedby="overskriftTitligeresaker" />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Sok.propTypes = {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok));
