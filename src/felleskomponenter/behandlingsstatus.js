import React, { Fragment } from 'react';
import PT from 'prop-types';
import moment from 'moment/moment';
import { connect } from 'react-redux';

import * as Api from '../services/api';
import * as Nav from '../utils/navFrontend';
import * as Mui from '../felleskomponenter/ui';
import * as MPT from '../proptypes';
import * as Utils from '../utils';

import { behandlingerOperations } from '../ducks/behandlinger';

import './behandlingsstatus.css';

const BehandlingsStatus = ({
  oppdaterStatus,
  behandlingID,
  redigerbart,
  oppsummering,
  behandlingsstatusMap,
  hentBehandling,
}) => {
  const [behandlingsstatus, setBehandlingsStatus] = React.useState('VELG');
  const [statusmelding, setStatusMelding] = React.useState(null);

  const onChange = event => {
    const { value } = event.currentTarget;
    setBehandlingsStatus(value);
    setStatusMelding(null);
  };

  const oppdaterStatusMelding = () => {
    const hhmm = moment().format('HH:mm');
    setStatusMelding(`Behandlingstatus ble oppdatert ${hhmm}`);
  };

  const sendOppdatering = () => {
    if (behandlingsstatus === 'VELG') {
      return false;
    }

    oppdaterStatus(behandlingID, behandlingsstatus).then(() => {
      hentBehandling(behandlingID);
      oppdaterStatusMelding();
    }).catch(Utils.logger.error);
    return true;
  };

  if (!oppsummering) return <div />;

  let endreBehandlingsStatusValg = [];
  if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = behandlingsstatusMap[oppsummering.behandlingsstatus.kode] || [];

  if (endreBehandlingsStatusValg.length === 0) return null;

  return (
    <div className="oppsummering__behandlingsstatus">
      <Fragment>
        <Mui.KodeTermSelect
          koder={endreBehandlingsStatusValg}
          value={behandlingsstatus}
          onChange={onChange}
          label="Endre behandlingsstatus:"
          redigerbar={redigerbart}
        />
        <Nav.Hovedknapp disabled={!redigerbart} onClick={sendOppdatering}>Oppdater</Nav.Hovedknapp>
        {statusmelding && <div><br /><Nav.AlertStripe type="suksess" className="varsel">{statusmelding}</Nav.AlertStripe></div>}
      </Fragment>
    </div>
  );
};

BehandlingsStatus.propTypes = {
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool,
  oppsummering: MPT.Behandlinger.Oppsummering,
  oppdaterStatus: PT.func,
  behandlingsstatusMap: PT.objectOf(PT.arrayOf(MPT.Kodeverk)).isRequired,
  hentBehandling: PT.func.isRequired,
};

BehandlingsStatus.defaultProps = {
  redigerbart: false,
  oppsummering: undefined,
  oppdaterStatus: Api.Behandlinger.status.oppdaterStatus,
};

const mapDispatchToProps = dispatch => ({
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
});

export default connect(null, mapDispatchToProps)(BehandlingsStatus);
