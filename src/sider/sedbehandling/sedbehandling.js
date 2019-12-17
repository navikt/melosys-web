import React, { useEffect } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import MKV from '../../melosyskodeverk';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';
import * as MPT from '../../proptypes';
import * as Api from '../../services/api';

import SideDialog from '../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from '../../felleskomponenter/sideOppsummering';
import Behandlingsstatus from '../../felleskomponenter/behandlingsstatus';
import Behandlingsmeny from './komponenter/behandlingsmeny';

import { fagsakSelectors } from '../../ducks/fagsaker';
import { behandlingerOperations, behandlingerSelectors } from '../../ducks/behandlinger';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { datalastingOperations } from '../../ducks/datalasting';
import { soknadOperations, soknadSelectors } from '../../ducks/soknad';

import './sedbehandling.css';

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
  ],
};

const SedBehandling = ({
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  match,
  behandlingstype,
  redigerbart,
  fagsak,
  oppsummering,
  person,
  oppholdsland,
  soknadsperiodeFom,
  soknadsperiodeTom,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  oppdaterBehandlingsStatus,
  location,
  lastInnSaksopplysninger,
  resetSaksopplysninger,
  hentSoknad,
  lagreOgLukk,
  tilbakeleggOppgave,
  visHenleggDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visAvslagSoknadDialogHandle,
  visOppfriskBekreftelse,
  apneTidligereBehandlinger,
}) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, 'behandlingID'));
  const { params: { snr: saksnummer } } = match;

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);

    return () => {
      resetSaksopplysninger();
    };
  }, []);

  const soknadIkkeYrkesaktiv = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.SOEKNAD_IKKE_YRKESAKTIV;
  useEffect(() => {
    if (soknadIkkeYrkesaktiv) {
      hentSoknad(behandlingID);
    }
  }, [behandlingstype]);

  const oppdaterStatus = (_, behandlingsstatus) => {
    if (behandlingsstatus === MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET) {
      return Api.Fagsaker.fagsak.avslutt(saksnummer);
    }
    return Api.Behandlinger.status.oppdaterStatus(behandlingID, behandlingsstatus);
  };

  return (
    <div className="sedbehandling">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7" />
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstype={behandlingstype}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              oppholdsland={soknadIkkeYrkesaktiv ? oppholdsland : []}
              soknadsperiodeFom={soknadIkkeYrkesaktiv ? soknadsperiodeFom : undefined}
              soknadsperiodeTom={soknadIkkeYrkesaktiv ? soknadsperiodeTom : undefined}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              renderBehandlingsmeny={() => <Behandlingsmeny
                redigerbart={redigerbart}
                lagreOgLukkHandle={lagreOgLukk}
                tilbakeleggeHandle={tilbakeleggOppgave}
                visHenleggDialogHandle={visHenleggDialogHandle}
                apneTidligereBehandlinger={apneTidligereBehandlinger}
                visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                visHenleggSak
                visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                visOppfriskSaksopplysninger
                oppfriskSaksopplysningerHandle={visOppfriskBekreftelse}
              />}
              renderBehandlingsstatus={() => <Behandlingsstatus
                behandlingID={behandlingID}
                redigerbart={redigerbart}
                oppsummering={oppsummering}
                oppdaterBehandlingsStatus={oppdaterBehandlingsStatus}
                behandlingsstatusMap={behandlingsstatusMap}
                oppdaterStatus={oppdaterStatus}
              />}
            />
            <SideDialog
              behandlingID={behandlingID}
              saksnummer={saksnummer}
              brevBestillingRedigerbart={brevBestillingRedigerbart}
              brevBestillingRedigerbartIArtikkel13={brevBestillingRedigerbartIArtikkel13}
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

SedBehandling.propTypes = {
  brevBestillingRedigerbart: PT.bool.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  match: PT.object.isRequired,
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  soknadsperiodeFom: PT.string,
  soknadsperiodeTom: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  oppdaterBehandlingsStatus: PT.func.isRequired,
  location: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  hentSoknad: PT.func.isRequired,
  lagreOgLukk: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visOppfriskBekreftelse: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
};

SedBehandling.defaultProps = {
  fagsak: undefined,
  oppsummering: undefined,
  oppholdsland: [],
  soknadsperiodeFom: undefined,
  soknadsperiodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

const mapStateToProps = state => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  oppholdsland: soknadSelectors.OppholdsLandKTSelector(state),
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).fom),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).tom),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysningerSedBehandling(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentSoknad: behandlingID => dispatch(soknadOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SedBehandling);
