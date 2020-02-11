import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import * as Ikoner from '../../resources/images';
import * as Utils from '../../utils';

import PanelHeader from '../panelHeader/panelHeader';

import { behandlingerSelectors } from '../../ducks/behandlinger';

export const Kontantytelser = ({ sakOgBehandling: { eosBarnetrygd } }) => (
  <div className="panelSeksjon">
    <Nav.EkspanderbartpanelBase
      heading={<PanelHeader ikon={Ikoner.Inntekt} tittel={KV.Paneltitler.kontantytelser} />}
      ariaTittel="Panel for kontantytelser fra NAV"
    >
      <Nav.Row>
        <Nav.Column xs="9">
          <Nav.Fieldset legend="Mottar søkeren EU/EØS-barnetrygd fra NAV?">
            {Utils.streng.boolTilNorsk(eosBarnetrygd)}
          </Nav.Fieldset>
        </Nav.Column>
      </Nav.Row>
    </Nav.EkspanderbartpanelBase>
  </div>
);

Kontantytelser.propTypes = {
  sakOgBehandling: PT.object.isRequired,
};

const mapStateToProps = state => ({
  sakOgBehandling: behandlingerSelectors.SakOgBehandlingSelector(state),
});

export default connect(mapStateToProps)(Kontantytelser);
