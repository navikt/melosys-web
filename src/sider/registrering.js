/* eslint no-alert:off, consistent-return:off */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as Nav from '../utils/navFrontend';
import Saksopplysninger from '../registrering-komponenter/saksopplysninger';

import './registrering.css';
import SideOppsummering from '../soknad-komponenter/sideOppsummering';
import { behandlingerOperations, behandlingerSelectors } from '../ducks/behandlinger';

import * as MPT from '../proptypes';
import SideDialog from '../soknad-komponenter/sideDialog/sideDialog';
import * as Utils from '../utils';
import PT from 'prop-types';
import { fagsakOperations } from '../ducks/fagsaker';

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

    const { hentFagsaker, hentBehandling } = this.props;
    try {
      await hentFagsaker(snr);
      await hentBehandling(behandlingID);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  render() {
    const { behandlingID } = this.state;
    const { medlemskap, sed, oppsummering } = this.props;
    return (
      <div className="registrering">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="7">
              <Saksopplysninger
                behandlingID={behandlingID}
                medlemskap={medlemskap}
                sed={sed}
              />
            </Nav.Column>
            <Nav.Column xs="5">
              {/*
              <SideOppsummering
                behandlingID={behandlingID}
                oppsummering={oppsummering}
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
  hentFagsaker: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Oppsummering,
  sed: PT.object,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
};
Registrering.defaultProps = {
  medlemskap: {},
  oppsummering: {},
  sed: {},
};
const mapStateToProps = state => ({
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Registrering);
