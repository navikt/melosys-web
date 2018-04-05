import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import * as Nav from '../utils/navFrontend';
// import SokListe from '../felles-komponenter/sok/sokListe';
import SokResultat from '../felles-komponenter/sok/sokResultat';
import Statistikk from '../felles-komponenter/forside/statistikk';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import MineSaker from '../felles-komponenter/forside/minesaker';
import Sok from '../felles-komponenter/forside/sok';
import Logg from '../felles-komponenter/forside/logg';

// import * as Oppgaver from '../ducks/oppgaver';
import * as NyeSaker from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles';
import { TidligeresakerSelector } from '../ducks/tidligeresaker';

import './forside.css';

const queryString = require('query-string');

class Forside extends Component {
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
    /*
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
    */
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
      <div className="forside">
        { children }
        <Nav.Container>
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Innholdstittel id="soke">Velkommen til Melosys</Nav.Innholdstittel>
              <SokeForm onSubmit={this.queryStringHandler} />
              { visSokResultat && <SokResultat saker={nyesaker} opprettSak={() => this.props.opprettSak(this.state.fnr)} /> }
              <MineSaker />
            </Nav.Column>

            <Nav.Column xs="5">
              <Statistikk />
              <Journalforing />
              <Behandling />
              <Sok />
              <Logg />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Forside.propTypes = {
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

Forside.defaultProps = {
  children: null,
  nyesaker: [],
};

const mapStateToProps = state => ({
  nyesaker: NyeSaker.NyesakerSelector(state),
  sakerbehandles: SakerbehandlesSelector(state),
  tidligeresaker: TidligeresakerSelector(state),
  visSokResultat: (state.nyesaker.status === 'OK'),
});

const mapDispatchToProps = dispatch => ({
  // plukkOppgave: oppgave => dispatch(Oppgaver.oppgaverOperations.oppgavePlukker(oppgave)),
  hentNyesaker: fnr => dispatch(NyeSaker.hentNyesaker(fnr)),
  opprettSak: fnr => dispatch(NyeSaker.opprettNyFagsak(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
];
export default withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(Forside)));
