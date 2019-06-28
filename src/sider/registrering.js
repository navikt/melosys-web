/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes';
import * as Utils from '../utils';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';
import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';
import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta';
import { soknadOperations } from '../ducks/soknad';

import './registrering.css';
import { lovvalgsperioderOperations } from '../ducks/lovvalgsperioder';

class Registrering extends Component {
  state = {
    behandlingID: -1,
  };
  componentDidMount() {
    this.lastInnSaksopplysninger();
  }

  lastInnSaksopplysninger= async () => {
    const { match, location } = this.props;
    const { snr } = match.params;
    const behandlingID = Utils.queryString.getParam(location, 'behandlingID');
    this.setState({ behandlingID: Utils._toInteger(behandlingID) });

    const {
      hentAvklartefakta, hentBehandling, hentFagsaker, hentLovvalgsperioder, hentSoknad,
    } = this.props;
    try {
      await hentFagsaker(snr);
      await hentBehandling(behandlingID);
      await hentAvklartefakta(behandlingID);
      await hentSoknad(behandlingID);
      await hentLovvalgsperioder(behandlingID);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  render() {
    const { behandlingID } = this.state;
    const { vurderingBegrunnelser, medlemskap, sed } = this.props;
    return (
      <div className="registrering">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Saksopplysninger
                behandlingID={behandlingID}
                medlemskap={medlemskap}
                sed={sed}
                vurderingBegrunnelser={vurderingBegrunnelser}
              />
            </Nav.Column>
            <Nav.Column xs="5">
              <SideDialog behandlingID={behandlingID} />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    );
  }
}
Registrering.propTypes = {
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  hentSoknad: PT.func.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.object,
  fagsak: MPT.Fagsak,
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Behandlinger.Oppsummering,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  history: PT.object.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};
Registrering.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  medlemskap: {},
  oppsummering: {},
  sed: {},
  vurderingBegrunnelser: {},
};
const mapStateToProps = state => ({
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: avklartefaktaSelectors.VurderingUnntakPeriode(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  hentSoknad: behandlingID => dispatch(soknadOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
