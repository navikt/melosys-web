import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import * as Nav from '../utils/navFrontend';
// import SokListe from '../felles-komponenter/sok/sokListe';
import SokResultat from '../felles-komponenter/sok/sokResultat';
import * as Oppgaver from '../ducks/oppgaver';
import * as NyeSaker from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles';
import { TidligeresakerSelector } from '../ducks/tidligeresaker';

import './forside.css';

const queryString = require('query-string');

class Sok extends Component {
  constructor(props) {
    super(props);
    this.queryStringHandler = this.queryStringHandler.bind(this);
  }

  componentWillMount() {
    const queryParams = queryString.parse(this.props.location.search);
    const { fnr } = queryParams;

    if (fnr) {
      this.setState({ fnr });
      this.props.hentNyesaker(fnr);
    }
    // this.props.hentMineSaker();
    const behandling = {
      oppgavetype: 'BEH_SAK',
      sakstyper: [
        'EU_EOS',
        'TRYGDAVTALE',
        'FOLKETRYGD',
      ],
      behandlingstyper: [
        'ae0034',
        'ae0058',
      ],
    };
    const journalforing = {
      oppgavetype: 'JFR',
      sakstyper: [
        'EU_EOS',
        'TRYGDAVTALE',
        'FOLKETRYGD',
      ],
    };
    this.props.plukkOppgave(journalforing);
  }

  /** Henter saker basert på fødselsnummer og setter query string 'fnr=xxxxxxxxxxx' slik at
   * deter mulig å linke direkte til et søk.
   *
   * @param value
   */
  queryStringHandler(value) {
    const { history, hentNyesaker } = this.props;
    history.push(`?fnr=${value.fnr}`);
    hentNyesaker(value.fnr);
  }

  render() {
    // const { nyesaker, sakerbehandles, tidligeresaker } = this.props;
    const { nyesaker, children } = this.props;
    const { visSokResultat } = this.props;

    return (
      <div className="sok">
        { children }
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
  hentMineSaker: PT.func.isRequired,
  nyesaker: PT.any,
  hentNyesaker: PT.func.isRequired,
  tidligeresaker: PT.array.isRequired,
  sakerbehandles: PT.array.isRequired,
  location: PT.object.isRequired,
  visSokResultat: PT.bool.isRequired,
  history: PT.object.isRequired,
  opprettSak: PT.func.isRequired,
  children: PT.node,
};

Sok.defaultProps = {
  children: null,
  nyesaker: [],
};

const mapStateToProps = state => ({
  oppgaver: Oppgaver.oppgaverSelectors.MineSakerSelector(state),
  nyesaker: NyeSaker.NyesakerSelector(state),
  sakerbehandles: SakerbehandlesSelector(state),
  tidligeresaker: TidligeresakerSelector(state),
  visSokResultat: (state.nyesaker.status === 'OK'),
});

const mapDispatchToProps = dispatch => ({
  hentMineSaker: () => dispatch(Oppgaver.oppgaverOperations.hentMineSaker()),
  plukkOppgave: oppgave => dispatch(Oppgaver.oppgaverOperations.oppgavePlukker(oppgave)),
  hentNyesaker: fnr => dispatch(NyeSaker.hentNyesaker(fnr)),
  opprettSak: fnr => dispatch(NyeSaker.opprettNyFagsak(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
];
export default withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok)));
