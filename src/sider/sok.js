import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import SokeForm from '../moduler/arbeidsforhold/soke-form';
import * as Nav from '../utils/navFrontend';
// import SokListe from '../felles-komponenter/sok/sokListe';
import SokResultat from '../felles-komponenter/sok/sokResultat';
import * as NyeSaker from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles';
import { TidligeresakerSelector } from '../ducks/tidligeresaker';

import './sok.css';

const queryString = require('query-string');

class Sok extends Component {
  constructor(props) {
    super(props);
    this.queryStringHandler = this.queryStringHandler.bind(this);
  }

  componentWillMount() {
    this.setState({ brukerHarGjortSok: false });
    const queryParams = queryString.parse(this.props.location.search);
    const { fnr } = queryParams;

    if (fnr) {
      this.setState({ fnr });
      this.props.hentNyesaker(fnr);
    }
  }

  /** Henter saker basert på fødselsnummer og setter query string 'fnr=xxxxxxxxxxx' slik at
   * deter mulig å linke direkte til et søk.
   *
   * @param value
   */
  queryStringHandler(value) {
    this.setState({ brukerHarGjortSok: true });
    const { history, hentNyesaker } = this.props;
    history.push(`?fnr=${value.fnr}`);
    hentNyesaker(value.fnr);
  }

  render() {
    // const { nyesaker, sakerbehandles, tidligeresaker } = this.props;
    const { nyesaker } = this.props;
    const { visSokResultat } = this.props;

    return (
      <div className="sok">
        <Nav.Container>
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Innholdstittel id="soke">Velkommen til Melosys</Nav.Innholdstittel>
              <SokeForm onSubmit={this.queryStringHandler} />
              { visSokResultat && <SokResultat saker={nyesaker} opprettSak={() => this.props.opprettSak(this.state.fnr)} /> }
            </Nav.Column>

            {/*
            <Nav.Column xs="5">
              <Nav.Innholdstittel id="overskriftUnderbehandling">Saker under behandling</Nav.Innholdstittel>
              <SokListe saker={sakerbehandles} kanViseFlereSaker aria-describedby="overskriftUnderbehandling" />
              <Nav.Innholdstittel id="overskriftTitligeresaker">Tidligere behandlede saker</Nav.Innholdstittel>
              <SokListe saker={tidligeresaker} kanViseFlereSaker aria-describedby="overskriftTitligeresaker" />
            </Nav.Column>
            */}
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
  location: PT.object.isRequired,
  visSokResultat: PT.bool.isRequired,
  history: PT.object.isRequired,
  opprettSak: PT.func.isRequired,
};

const mapStateToProps = state => ({
  nyesaker: NyeSaker.NyesakerSelector(state),
  sakerbehandles: SakerbehandlesSelector(state),
  tidligeresaker: TidligeresakerSelector(state),
  visSokResultat: (state.nyesaker.status === 'OK'),
});

const mapDispatchToProps = dispatch => ({
  hentNyesaker: fnr => dispatch(NyeSaker.hentNyesaker(fnr)),
  opprettSak: fnr => dispatch(NyeSaker.opprettSak(fnr)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok));
