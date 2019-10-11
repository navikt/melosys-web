import React, { Fragment } from 'react';
import PT from 'prop-types';
import moment from 'moment/moment';

import * as MKV from 'melosys-kodeverk';
import * as KV from '../kodeverk';
import * as Api from '../services/api';
import * as Nav from '../utils/navFrontend';
import * as Mui from '../felleskomponenter/ui';
import * as MPT from '../proptypes';

import './behandlingsstatus.css';

const BehandlingsStatus = ({
  oppdaterBehandlingsStatus,
  behandlingID,
  redigerbart,
  oppsummering,
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
    const nyBehandlingsStatus = { behandlingsstatus, term };
    Api.Behandlinger.status.oppdaterStatus(behandlingID, behandlingsstatus).then(() => {
      oppdaterBehandlingsStatus(nyBehandlingsStatus);
      oppdaterStatusMelding();
    });
    return true;
  };

  const hentBehandlingsStatusValg = kode => {
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
        return [
          { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
          { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
        ];
      default:
        return [];
    }

    endreStatusValg = [...endreStatusValg, { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING }];
    return endreStatusValg;
  };

  if (!oppsummering) return <div />;

  let endreBehandlingsStatusValg = [];
  if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = hentBehandlingsStatusValg(oppsummering.behandlingsstatus.kode);

  return (
    <div className="oppsummering__behandlingsstatus">
      { endreBehandlingsStatusValg.length !== 0 &&
        <Fragment>
          <Mui.KodeTermSelect
            koder={endreBehandlingsStatusValg}
            value={behandlingsstatus}
            onChange={onChange}
            label="Endre status på behandlingen:"
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
};
BehandlingsStatus.defaultProps = {
  redigerbart: false,
  oppsummering: undefined,
};

export default BehandlingsStatus;
