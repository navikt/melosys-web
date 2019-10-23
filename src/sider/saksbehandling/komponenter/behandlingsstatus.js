import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import moment from 'moment/moment';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import * as Api from '../../../services/api';
import * as Nav from '../../../utils/navFrontend';

import * as MPT from '../../../proptypes';
import { behandlingerOperations, behandlingerSelectors } from '../../../ducks/behandlinger';
import { redigerbartSelectors } from '../../../ducks/redigerbart';
import * as Mui from '../../../felleskomponenter/ui';

import './sideOppsummering.css';

class BehandlingsStatus extends Component {
  state = {
    behandlingsstatus: 'VELG',
    statusmelding: null,
  };

  onChange = event => {
    const { value } = event.currentTarget;
    this.setState({ behandlingsstatus: value, statusmelding: null });
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  oppdaterStatusMelding = () => {
    const { behandlingsstatus } = this.state;
    const hhmm = moment().format('HH:mm');
    this.setState({ behandlingsstatus, statusmelding: `Behandlingstatus ble oppdatert ${hhmm}` });
  };

  sendOppdatering = () => {
    const { behandlingsstatus: kode } = this.state;
    if (kode === 'VELG') {
      return false;
    }
    const { oppdaterBehandlingsStatus, behandlingID } = this.props;
    const term = KV.kodeTilTerm(kode, MKV.KTObjects.behandlinger.behandlingsstatus);
    const nyBehandlingsStatus = { kode, term };
    Api.Behandlinger.status.oppdaterStatus(behandlingID, kode).then(() => {
      oppdaterBehandlingsStatus(nyBehandlingsStatus);
      this.oppdaterStatusMelding();
    });
    return true;
  };

  hentBehandlingsStatusValg = kode => {
    let endreStatusValg = [];

    switch (kode) {
      case MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
          { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
        ];
        break;
      case MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
        ];
        break;
      case MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
        ];
        break;
      case MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING:
        return [];
      default:
        return [];
    }

    endreStatusValg = [...endreStatusValg, { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING }];
    return endreStatusValg;
  };

  render() {
    const {
      redigerbart,
      oppsummering,
    } = this.props;

    if (!oppsummering) return <div />;

    let endreBehandlingsStatusValg = [];
    if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = this.hentBehandlingsStatusValg(oppsummering.behandlingsstatus.kode);

    return (
      <div className="oppsummering__behandlingsstatus">
        { endreBehandlingsStatusValg.length !== 0 &&
        <form onSubmit={this.overstyrSubmit}>
          <Mui.KodeTermSelect
            koder={endreBehandlingsStatusValg}
            value={this.state.behandlingsstatus}
            onChange={this.onChange}
            label="Endre status på behandlingen:"
            redigerbar={redigerbart}
          />
          <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={this.sendOppdatering}>Oppdater</Nav.Hovedknapp>
          {this.state.statusmelding && <div><br /><Nav.AlertStripe type="suksess" className="varsel">{this.state.statusmelding}</Nav.AlertStripe></div>}
        </form>
        }
      </div>
    );
  }
}

BehandlingsStatus.propTypes = {
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool,
  oppsummering: MPT.Behandlinger.Oppsummering,
  oppdaterBehandlingsStatus: PT.func.isRequired,
};
BehandlingsStatus.defaultProps = {
  redigerbart: false,
  oppsummering: undefined,
};

const mapStateToProps = state => ({
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  endreLovvalgsperiodeRedigerbart: redigerbartSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BehandlingsStatus);
