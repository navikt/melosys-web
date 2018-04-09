import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';
import SakEnkeltLinje from '../felles-komponenter/forside/saksliste/sakEnkeltLinje';
import Statistikk from '../felles-komponenter/forside/statistikk';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import SokSkjema from '../felles-komponenter/forside/sokskjema';
import Logg from '../felles-komponenter/forside/logg';

import * as NyeSaker from '../ducks/nyesaker';

import './sok.css';

const uuid = require('uuid/v4');

class Sok extends Component {
  constructor(props) {
    super(props);
    this.queryStringHandler = this.queryStringHandler.bind(this);
  }

  componentWillMount() {
    const { match, hentNyesaker } = this.props;
    const { fnr } = match.params;
    if (fnr) hentNyesaker(fnr);
  }

  /** Henter saker basert på fødselsnummer og setter query string 'fnr=xxxxxxxxxxx' slik at
   * det er mulig å linke direkte til et søk.
   *
   * @param value
   */
  queryStringHandler(value) {
    const { history, hentNyesaker } = this.props;
    history.push(`?fnr=${value.fnr}`);
    hentNyesaker(value.fnr);
  }

  render() {
    const { nyesaker, children } = this.props;
    const { fnr } = this.props.match.params;

    return (
      <div className="sok">
        { children }
        <Nav.Container>
          <Nav.Row>
            <Nav.Column xs="7">
              <section className="sokresultat">
                <h1>Fant {nyesaker.length} treff etter søk på &quot;{fnr}&quot;</h1>
                {nyesaker && nyesaker.map(sak => <SakEnkeltLinje key={uuid()} sak={sak} />)}
              </section>
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
  sokStreng: PT.string,
  children: PT.node,
  match: PT.object.isRequired,
};

Sok.defaultProps = {
  children: null,
  sokStreng: '',
  nyesaker: [],
};

const mapStateToProps = state => ({
  nyesaker: NyeSaker.NyesakerSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentNyesaker: fnr => dispatch(NyeSaker.hentNyesaker(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
];
export default withErrorHandling(kontekster, withRouter(connect(mapStateToProps, mapDispatchToProps)(Sok)));
