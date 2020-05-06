import React, { Fragment } from 'react';
import PT from 'prop-types';
import moment from 'moment/moment';

import MKV from '../melosyskodeverk';
import * as KV from '../kodeverk';
import * as Api from '../services/api';
import * as Nav from '../utils/navFrontend';
import * as Mui from '../felleskomponenter/ui';
import * as MPT from '../proptypes';
import * as Utils from '../utils';

import './behandlingsstatus.css';

const BehandlingsStatus = ({
  oppdaterBehandlingsStatus,
  oppdaterStatus,
  behandlingID,
  redigerbart,
  oppsummering,
  behandlingsstatusMap,
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
    const term = KV.kodeTilTerm(behandlingsstatus, MKV.KTObjects.behandlinger.behandlingsstatus);
    const nyBehandlingsStatus = { kode: behandlingsstatus, term };
    oppdaterStatus(behandlingID, behandlingsstatus).then(() => {
      oppdaterBehandlingsStatus(nyBehandlingsStatus);
      oppdaterStatusMelding();
    }).catch(Utils.logger.error);
    return true;
  };

  if (!oppsummering) return <div />;

  let endreBehandlingsStatusValg = [];
  if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = behandlingsstatusMap[oppsummering.behandlingsstatus.kode] || [];

  return (
    <div className="oppsummering__behandlingsstatus">
      { endreBehandlingsStatusValg.length !== 0 &&
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
      }
    </div>
  );
};

BehandlingsStatus.propTypes = {
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool,
  oppsummering: MPT.Behandlinger.Oppsummering,
  oppdaterBehandlingsStatus: PT.func.isRequired,
  oppdaterStatus: PT.func,
  behandlingsstatusMap: PT.objectOf(PT.arrayOf(MPT.Kodeverk)).isRequired,
};

BehandlingsStatus.defaultProps = {
  redigerbart: false,
  oppsummering: undefined,
  oppdaterStatus: Api.Behandlinger.status.oppdaterStatus,
};

export default BehandlingsStatus;
