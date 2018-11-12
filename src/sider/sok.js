import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import qs from 'qs';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import SakEnkeltLinje from '../felles-komponenter/forside/oppgaveliste/sakEnkeltLinje';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import SokSkjema from '../felles-komponenter/forside/sokskjema';

import { sokSelectors, sokOperations } from '../ducks/sok';
import { KodeverkSelectors } from '../ducks/kodeverk';
import './sok.css';

const uuid = require('uuid/v4');

const queryParamLogger = (fnr, location) => {
  const qsParsed = qs.parse(location.search.slice(1));
  const urlQuery = `${location.pathname}${location.search}`;
  /* eslint-disable */
  if (qsParsed) {
    if (qsParsed.kilde === 'GOSYS') {
      const message = `Deeplinked from GOSYS: ${urlQuery}`;
      window.frontendlogger.info(message);
    } else {
      const message = `Ukjent ekstern kilde: ${urlQuery}`;
      window.frontendlogger.error(message);
    }
  } else {
    console.log('internal route:', urlQuery);
  }
  /* eslint-enable */
};

class Sok extends Component {
  componentWillMount() {
    const { match, location, sokBehandlingsOppgaver } = this.props;
    const { fnr } = match.params;
    if (fnr) {
      queryParamLogger(fnr, location);
      sokBehandlingsOppgaver(fnr);
    }
  }

  render() {
    const { sokResultat, sakstypeKoder, children } = this.props;
    const { fnr } = this.props.match.params;
    if (!sokResultat) return null;

    const { saksbehandling = [] } = sokResultat;
    const plural = saksbehandling.length > 1 ? 'r' : '';

    return (
      <div className="sok">
        { children }
        <Nav.Container>
          <Nav.Row className="">
            <Nav.Column xs="7">
              <section className="sokresultat">
                <h1>{saksbehandling.length} oppgave{plural} knyttet til fnr / dnr &quot;{fnr}&quot;</h1>
                { saksbehandling.map(oppgave => {
                  const sakstype = sakstypeKoder.find(item => item.kode === oppgave.sakstypeKode);
                  const sak = {
                    sakstype,
                    ...oppgave,
                  };
                  return (<SakEnkeltLinje key={uuid()} sak={sak} />);
                })}
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
  sakstypeKoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  sokResultat: MPT.MineOppgaver,
  sokBehandlingsOppgaver: PT.func.isRequired,
  sokStreng: PT.string,
  children: PT.node,
  match: PT.object.isRequired,
};

Sok.defaultProps = {
  children: null,
  sokStreng: '',
  sokResultat: {},
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
