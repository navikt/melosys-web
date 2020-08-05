import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';

import { behandlingerSelectors } from '../../../../ducks/behandlinger';

export const Kontantytelser = ({ sakOgBehandling: { eosBarnetrygd } }) => (
  <Nav.Fieldset legend="Mottar søkeren EU/EØS-barnetrygd fra NAV?">
    {Utils.streng.boolTilNorsk(eosBarnetrygd)}
  </Nav.Fieldset>
);

Kontantytelser.propTypes = {
  sakOgBehandling: PT.object.isRequired,
};

const mapStateToProps = state => ({
  sakOgBehandling: behandlingerSelectors.SakOgBehandlingSelector(state),
});

export default connect(mapStateToProps)(Kontantytelser);
