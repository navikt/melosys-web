import React from 'react';
import PT from 'prop-types';
import moment from 'moment/moment';

import * as MKV from 'melosys-kodeverk';
import * as RegistreringContext from '../../state/registreringContext';
import * as KV from '../../../../kodeverk';
import * as Api from '../../../../services/api';
import * as Nav from '../../../../utils/navFrontend';

import * as MPT from '../../../../proptypes';
import { behandlingerOperations, behandlingerSelectors } from '../../../../ducks/behandlinger';
import { KodeTermSelect } from '../../../../felleskomponenter/ui/kodeTermSelect';

import './sideOppsummering.css';

const BehandlingsStatus = props => {
  const [behandlingsstatus, setBehandlingsStatus] = React.useState('VELG');
  const [statusmelding, setStatusMelding] = React.useState(null);

  const onChange = event => {
    const { value } = event.currentTarget;
    setBehandlingsStatus(value);
    setStatusMelding(null);
  };

  const overstyrSubmit = event => {
    event.preventDefault();
  };

  const oppdaterStatusMelding = () => {
    const hhmm = moment().format('HH:mm');
    setStatusMelding(`Behandlingstatus ble oppdatert ${hhmm}`);
  };

  const sendOppdatering = () => {
    if (behandlingsstatus === 'VELG') {
      return false;
    }
    const { oppdaterBehandlingsStatus, behandlingID } = props;
    const term = KV.kodeTilTerm(behandlingsstatus, MKV.KTObjects.behandlinger.status);
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
      case MKV.Koder.behandlinger.status.VURDER_DOKUMENT:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.status.AVVENT_DOK_UTL },
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.status.AVVENT_DOK_PART },
        ];
        break;
      case MKV.Koder.behandlinger.status.AVVENT_DOK_UTL:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.status.AVVENT_DOK_PART },
        ];
        break;
      case MKV.Koder.behandlinger.status.AVVENT_DOK_PART:
        endreStatusValg = [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.status.AVVENT_DOK_UTL },
        ];
        break;
      case MKV.Koder.behandlinger.status.UNDER_BEHANDLING:
        return [
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.status.AVVENT_DOK_UTL },
          { kode: MKV.Koder.behandlinger.status.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.status.AVVENT_DOK_PART },
        ];
      default:
        return [];
    }

    endreStatusValg = [...endreStatusValg, { kode: MKV.Koder.behandlinger.status.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.status.UNDER_BEHANDLING }];
    return endreStatusValg;
  };

  const {
    redigerbart,
    oppsummering,
  } = props;

  if (!oppsummering) return <div />;

  let endreBehandlingsStatusValg = [];
  if (oppsummering.behandlingsstatus) endreBehandlingsStatusValg = hentBehandlingsStatusValg(oppsummering.behandlingsstatus.kode);

  return (
    <div className="oppsummering__behandlingsstatus">
      { endreBehandlingsStatusValg.length !== 0 &&
      <form onSubmit={overstyrSubmit}>
        <KodeTermSelect
          koder={endreBehandlingsStatusValg}
          value={behandlingsstatus}
          onChange={onChange}
          label="Endre status på behandlingen:"
          redigerbar={redigerbart}
        />
        <Nav.Hovedknapp htmlType="submit" disabled={!redigerbart} onClick={sendOppdatering}>Oppdater</Nav.Hovedknapp>
        {statusmelding && <div><br /><Nav.AlertStripe type="suksess" className="varsel">{statusmelding}</Nav.AlertStripe></div>}
      </form>
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

const mapStateToProps = state => ({
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: behandlingerSelectors.RedigerbartSelector(state),
  endreLovvalgsperiodeRedigerbart: behandlingerSelectors.EndreLovvalgsPeriodeRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(BehandlingsStatus);
