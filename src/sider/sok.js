import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';
import Fagsak from '../felles-komponenter/forside/oppgaveliste/fagsak';


import { queryParamLogger } from '../utils/queryParamLogger';
import './sok.css';
import { sokSelectors, sokOperations } from '../ducks/sok';

const uuid = require('uuid/v4');

class Sok extends Component {
  componentWillMount() {
    const { match, location, sokBehandlingsOppgaver } = this.props;
    const { fnr } = match.params;
    if (fnr) {
      queryParamLogger(location, 'kilde', 'GOSYS');
      sokBehandlingsOppgaver(fnr);
    }
  }

  render() {
    const { sokResultat, sakstypeKoder, children } = this.props;
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
              <h2>Resulater for fnr &quot;{fnr}&quot;</h2>
              { sokResultat.map(fagsak => {
                const sakstype = sakstypeKoder.find(item => item.kode === fagsak.sakstypeKode);
                const sak = {
                  sakstype,
                  ...fagsak,
                };
                return (<Fagsak key={uuid()} sak={sak} />);
              })}
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
  sakstypeKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  sokResultat: PT.array.isRequired,
  sokBehandlingsOppgaver: PT.func.isRequired,
  sokStreng: PT.string,
  children: PT.node,
  match: PT.object.isRequired,
};

Sok.defaultProps = {
  children: null,
  sokStreng: '',
};

const mapStateToProps = state => ({
  sakstypeKoder: KodeverkSelectors.sakstyperSelector(state),
  sokResultat: sokSelectors.SokResultatSelector(state),
});

const mapDispatchToProps = dispatch => ({
  sokBehandlingsOppgaver: fnr => dispatch(sokOperations.sok(fnr)),
});

const kontekster = [
  { navn: 'saksbehandler', melding: 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' },
  { navn: 'fagsaker', melding: 'Det har oppstått en feil: Kunne ikke hente fagsaker' },
  { navn: 'oppgaver', melding: 'Det har oppstått en feil: Kunne ikke søke etter oppgaver' },
];
export default withErrorHandling(kontekster, connect(mapStateToProps, mapDispatchToProps)(Sok));
