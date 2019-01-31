import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';
import SakEnkeltLinje from '../felles-komponenter/forside/oppgaveliste/sakEnkeltLinje';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import SokSkjema from '../felles-komponenter/forside/sokskjema';

import { sakstyper } from '../kodeverk/kodelister';

import { queryParamLogger } from '../utils/queryParamLogger';
import { sokSelectors, sokOperations } from '../ducks/sok';
import './sok.css';

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
    const { sokResultat, children } = this.props;
    const { fnr } = this.props.match.params;
    if (!sokResultat) return null;

    const ingenTreff = <Nav.Panel>Fant ingen oppgaver knyttet til fnr eller dnr {fnr}.</Nav.Panel>;

    return (
      <div className="sok">
        { children }
        <Nav.Container>
          <Nav.Row className="">
            <Nav.Column xs="7">
              <section className="sokresultat">
                <h1>Søk etter &quot;{fnr}&quot;</h1>
                { sokResultat.map(oppgave => {
                  const sakstype = sakstyper.find(item => item.kode === oppgave.sakstypeKode);
                  const sak = {
                    sakstype,
                    ...oppgave,
                  };
                  return (<SakEnkeltLinje key={uuid()} sak={sak} />);
                })}
                { sokResultat.length === 0 && ingenTreff }
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
  location: PT.object.isRequired,
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
