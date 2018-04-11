import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import withErrorHandling from '../hoc/withErrorHandling';
import * as Nav from '../utils/navFrontend';

import * as NyeSaker from '../ducks/nyesaker';
import { SakerbehandlesSelector } from '../ducks/sakerbehandles';
import { TidligeresakerSelector } from '../ducks/tidligeresaker';

// import Statistikk from '../felles-komponenter/forside/statistikk';
import Journalforing from '../felles-komponenter/forside/journalforing';
import Behandling from '../felles-komponenter/forside/behandling';
import MineSaker from '../felles-komponenter/forside/minesaker';
import Sok from '../felles-komponenter/forside/sokskjema';

import './forside.css';

const Forside = props => {
  const { children } = props;
  return (
    <div className="forside">
      { children }
      <Nav.Container>
        <Nav.Row>
          <Nav.Column xs="7">
            <MineSaker />
          </Nav.Column>
          <Nav.Column xs="5">
            <Journalforing />
            <Behandling />
            <Sok />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

Forside.propTypes = {
  nyesaker: PT.any,
  hentNyesaker: PT.func.isRequired,
  tidligeresaker: PT.array.isRequired,
  sakerbehandles: PT.array.isRequired,
  location: PT.object.isRequired,
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
