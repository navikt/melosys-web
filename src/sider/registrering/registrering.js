/* eslint no-alert:off, consistent-return:off */
import React from 'react';
import PT from 'prop-types';

import MKV from '../../melosyskodeverk';

import * as Utils from '../../utils/';
import * as Nav from '../../utils/navFrontend';
import * as MPT from '../../proptypes';

import SideDialog from '../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from '../../felleskomponenter/sideOppsummering';
import Behandlingsstatus from '../../felleskomponenter/behandlingsstatus';
import Behandlingsmeny from './komponenter/behandlingsmeny';
import { fagsakOperations, fagsakSelectors } from '../../ducks/fagsaker';
import { behandlingerOperations, behandlingerSelectors } from '../../ducks/behandlinger';
import { avklartefaktaOperations, avklartefaktaSelectors } from '../../ducks/avklartefakta';
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from '../../ducks/lovvalgsperioder';
import { oppgaverOperations } from '../../ducks/oppgaver';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { RegistreringStateProviderWrapper } from './state/registreringStateProvider';

import './registrering.css';

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
  ],
};

const Registrering = props => {
  const {
    match: { params: { snr } },
    tilForsiden,
    tilbakeleggOppgave,
    location,
    hentAvklartefakta,
    hentBehandling,
    hentFagsaker,
    hentLovvalgsperioder,
    vurderingBegrunnelser,
    medlemskap,
    sed,
    redigerbart,
    Saksopplysninger,
    behandlingstype,
    fagsak,
    oppsummering,
    person,
    lovvalgsperiodeFom,
    lovvalgsperiodeTom,
    oppdaterBehandlingsStatus,
    lovvalgsland,
  } = props;

  const saksnummer = snr;
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, 'behandlingID'));

  const lastInnSaksopplysninger = async () => {
    try {
      await Promise.all([
        hentBehandling(behandlingID),
        hentFagsaker(saksnummer),
        hentAvklartefakta(behandlingID),
        hentLovvalgsperioder(behandlingID),
      ]);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  React.useEffect(() => {
    lastInnSaksopplysninger();
    return () => props.resetFagsakState();
  }, []);

  const lagreOgLukk = () => {
    tilForsiden();
  };

  const tilbakeleggHandle = async () => {
    const venterPaaDokumentasjon = true;
    await tilbakeleggOppgave(behandlingID, venterPaaDokumentasjon);
    lagreOgLukk();
  };

  const apneTidligereBehandlinger = () => {
    Utils.url.nyFane(`sok/${person.fnr}`);
  };

  if (Utils._isNil(redigerbart)) return null;

  return (
    <div className="registrering">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Saksopplysninger
              redigerbart={redigerbart}
              behandlingID={behandlingID}
              medlemskap={medlemskap}
              sed={sed}
              vurderingBegrunnelser={vurderingBegrunnelser}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstype={behandlingstype}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              lovvalgsland={lovvalgsland}
              renderBehandlingsmeny={() => <Behandlingsmeny
                redigerbart={redigerbart}
                lagreOgLukkHandle={lagreOgLukk}
                tilbakeleggeHandle={tilbakeleggHandle}
                apneTidligereBehandlinger={apneTidligereBehandlinger}
              />}
              renderBehandlingsstatus={() => <Behandlingsstatus
                behandlingID={behandlingID}
                redigerbart={redigerbart}
                oppsummering={oppsummering}
                oppdaterBehandlingsStatus={oppdaterBehandlingsStatus}
                behandlingsstatusMap={behandlingsstatusMap}
              />}
            />
            <SideDialog
              saksnummer={saksnummer}
              behandlingID={behandlingID}
              brevBestillingRedigerbart={redigerbart}
              brevBestillingRedigerbartIArtikkel13={redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};
Registrering.propTypes = {
  Saksopplysninger: PT.oneOfType([PT.object, PT.func]).isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentBehandling: PT.func.isRequired,
  hentFagsaker: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  resetFagsakState: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  redigerbart: PT.bool,
  avklartefakta: MPT.AvklartefaktaListe,
  vurderingBegrunnelser: PT.object,
  fagsak: MPT.Fagsak,
  lovvalgsperioder: PT.array.isRequired, // TODO lag proptype
  medlemskap: MPT.Medlemskap,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  sed: MPT.Behandlinger.Saksopplysninger.SED,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  behandlingstype: PT.string.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  oppdaterBehandlingsStatus: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  lovvalgsland: MPT.Kodeverk.isRequired,
};
Registrering.defaultProps = {
  redigerbart: null,
  avklartefakta: [],
  fagsak: {},
  medlemskap: {},
  oppsummering: {},
  sed: {},
  vurderingBegrunnelser: {},
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};
const mapStateToProps = state => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vurderingBegrunnelser: avklartefaktaSelectors.VurderingUnntakPeriode(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  medlemskap: behandlingerSelectors.MedlemskapSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  sed: behandlingerSelectors.SEDSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).fom),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).tom),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
});

const mapDispatchToProps = dispatch => ({
  hentAvklartefakta: behandlingID => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentBehandling: behandlingID => dispatch(behandlingerOperations.hentBehandling(behandlingID)),
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
  resetFagsakState: () => dispatch(fagsakOperations.resetFagsakState()),
  hentLovvalgsperioder: behandlingID => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
  tilbakeleggOppgave: (oppgaveID, venterPaaDokumentasjon) => oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
});

export default RegistreringStateProviderWrapper(mapStateToProps, mapDispatchToProps)(Registrering);
