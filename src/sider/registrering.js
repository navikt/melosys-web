/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';
import './registrering.css';
import SideOppsummering from '../soknad-komponenter/sideOppsummering';

import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger';
import * as MPT from '../proptypes';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';
import * as Utils from '../utils';
import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker';
import * as Api from '../services/api';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../ducks/avklartefakta';

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

    const { hentAvklartefakta, hentBehandling, hentFagsaker } = this.props;
    try {
      await hentFagsaker(snr);
      await hentBehandling(behandlingID);
      await hentAvklartefakta(behandlingID);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  avsluttSakSomBortfalt = () => {
    const { fagsak: { saksnummer } } = this.props;
    Api.Fagsaker.bortfall(saksnummer).catch(err => Utils.logger.error(err));
    this.props.history.push('/');
  };

  avsluttSakSomBortfalt = () => {};
  visOppfriskBekreftelse = () => {};
  lagreOgLukk = () => {};
  tilbakeleggeHandle = () => {};
  visHenleggDialog = () => {};
  navigerTilOversiktSide = () => {};

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
              {/*
              <SideOppsummering
                behandlingID={behandlingID}
                avsluttSakSomBortfalt={this.avsluttSakSomBortfalt}
                oppfriskSaksopplysningerHandle={this.visOppfriskBekreftelse}
                lagreOgLukkHandle={this.lagreOgLukk}
                tilbakeleggeHandle={this.tilbakeleggeHandle}
                visHenleggDialogHandle={this.visHenleggDialog}
                tilForsidenHandle={this.navigerTilOversiktSide}
                />
               */}
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
