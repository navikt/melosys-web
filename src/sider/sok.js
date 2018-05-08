import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import SakEnkeltLinje from '../felles-komponenter/forside/oppgaveliste/sakEnkeltLinje';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import SokSkjema from '../felles-komponenter/forside/sokskjema';

import {
  oppgaverOperations,
  oppgaverSelectors,
} from '../ducks/oppgaver';

import './sok.css';

const uuid = require('uuid/v4');

class Sok extends Component {
  componentWillMount() {
    const { match, hentBehandlingsOppgaver } = this.props;
    const { fnr } = match.params;
    if (fnr) hentBehandlingsOppgaver(fnr);
  }

  render() {
    const { behandlingsoppgaver = [], children } = this.props;
    const { fnr } = this.props.match.params;

    if (!Array.isArray(behandlingsoppgaver)) { return null; }

    return (
      <div className="sok">
        { children }
        <Nav.Container>
          <Nav.Row>
            <Nav.Column xs="7">
              <section className="sokresultat">
                <h1>Fant {behandlingsoppgaver.length} treff etter søk på &quot;{fnr}&quot;</h1>
                { behandlingsoppgaver.map(oppgave => <SakEnkeltLinje key={uuid()} sak={oppgave} />)}
              </section>
            </Nav.Column>
            <Nav.Column xs="5">
              <h1>Behandle sak</h1>
              <SokSkjema />
              <Journalforing />
              <Behandling />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Sok.propTypes = {
  behandlingsoppgaver: MPT.OppgaverSok,
  hentBehandlingsOppgaver: PT.func.isRequired,
  sokStreng: PT.string,
  children: PT.node,
  match: PT.object.isRequired,
};

Sok.defaultProps = {
  children: null,
  sokStreng: '',
  behandlingsoppgaver: [],
};

const mapStateToProps = state => ({
  behandlingsoppgaver: oppgaverSelectors.SokOppgaveSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentBehandlingsOppgaver: fnr => dispatch(oppgaverOperations.sok(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];
export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(Sok));
