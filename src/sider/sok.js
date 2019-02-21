import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';
import Fagsak from '../forside-komponenter/oppgaveliste/fagsak';

import { sokSelectors, sokOperations } from '../ducks/sok';

import { queryParamLogger } from '../utils/queryParamLogger';
import './sok.css';

class Sok extends Component {
  componentWillMount() {
    const { match, location, sokFagsaker } = this.props;
    const { fnr } = match.params;
    if (fnr) {
      queryParamLogger(location, 'kilde', 'GOSYS');
      sokFagsaker(fnr);
    }
  }

  render() {
    const { sokResultat, children } = this.props;
    const { fnr } = this.props.match.params;
    if (!sokResultat) return null;

    const ingenTreff = <Nav.Panel>Fant ingen saker knyttet til fnr eller dnr {fnr}.</Nav.Panel>;

    return (
      <div className="sok">
        { children }
        <Nav.Container>
          <Nav.Row className="">
            <section className="sokresultat">
              <h1>Innsyn i sak</h1>
              <h2>
                Resultater for fnr &quot;{fnr}&quot;{sokResultat.length > 0 ? ` - ${sokResultat[0].sammensattNavn}` : undefined}
              </h2>
              { sokResultat.length > 0 &&
                sokResultat.map(fagsak => <Fagsak key={fagsak.saksnummer} sak={fagsak} />)
              }
              { sokResultat.length === 0 && ingenTreff }
            </section>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}

Sok.propTypes = {
  location: PT.object.isRequired,
  sokResultat: PT.array.isRequired,
  sokFagsaker: PT.func.isRequired,
  sokStreng: PT.string,
  children: PT.node,
  match: PT.object.isRequired,
};

Sok.defaultProps = {
  children: null,
  sokStreng: '',
};

const mapStateToProps = state => ({
  sokResultat: sokSelectors.FagsakSokSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sokFagsaker: fnr => dispatch(sokOperations.sok(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];
export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(Sok));
