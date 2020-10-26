import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from 'AppTypes';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as Etiketter from '../etiketter';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';

import './barnetrygd.css';

const mapStateToProps = (state: RootState) => ({
  sakOgBehandling: behandlingerSelectors.SakOgBehandlingSelector(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const Barnetrygd = ({
  sakOgBehandling: {
    eosBarnetrygd,
  },
}: PropsFromRedux) => (
  <Nav.Container fluid className="barnetrygd">
    <Nav.Row className="tittel">
      <Nav.Column xs="12">
        <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>EU/EØS-barnetrygd</Nav.typo.Undertittel>
        <Etiketter.FraRegister />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.typo.Normaltekst>Mottar søkeren EU/EØS-barnetrygd fra NAV?</Nav.typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="6">
        {Utils.streng.boolTilNorsk(eosBarnetrygd)}
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default connector(Barnetrygd);
