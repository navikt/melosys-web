import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import SokeForm from '../moduler/arbeidsforhold/soke-form';
import * as Nav from '../utils/navFrontend';
// import SokListe from '../felles-komponenter/sok/sokListe';
import SokResultat from '../felles-komponenter/forside/sokResultat';
import Statistikk from '../felles-komponenter/forside/statistikk';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import SokSkjema from '../felles-komponenter/forside/sokskjema';
import Logg from '../felles-komponenter/forside/logg';

import * as NyeSaker from '../ducks/nyesaker';
import { formSelectors } from '../ducks/form/';

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
    const { nyesaker, sokStreng, children } = this.props;
    const visSokResultat = sokStreng !== '';

    return (
      <div className="forside">
        { children }
        <Nav.Container>
          <Nav.Row>
            <Nav.Column xs="7">
              { visSokResultat && <SokResultat saker={nyesaker} sokStreng={sokStreng} /> }
            </Nav.Column>
            <Nav.Column xs="5">
              <Statistikk />
              <Journalforing />
              <Behandling />
              <SokSkjema />
              <Logg />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Sok.propTypes = {
  nyesaker: PT.any,
  hentNyesaker: PT.func.isRequired,
  location: PT.object.isRequired,
  history: PT.object.isRequired,
  opprettSak: PT.func.isRequired,
  sokStreng: PT.string,
  children: PT.node,
};

Sok.defaultProps = {
  children: null,
  sokStreng: '',
  nyesaker: [],
};

const mapStateToProps = state => ({
  nyesaker: NyeSaker.NyesakerSelector(state),
  sokStreng: formSelectors.SokFormStrengSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentNyesaker: fnr => dispatch(NyeSaker.hentNyesaker(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
];
export default withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok)));
