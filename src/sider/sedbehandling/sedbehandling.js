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
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from '../../ducks/behandlingsgrunnlag';

import './sedbehandling.css';

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, term: MKV.Terms.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, term: MKV.Terms.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, term: MKV.Terms.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT, term: MKV.Terms.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.ANMODNING_UNNTAK_SENDT]: [
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART, term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET, term: MKV.Terms.behandlinger.behandlingsstatus.AVSLUTTET },
    { kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING, term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING },
  ],
};

const SedBehandling = ({
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  sideDialogRedigerbart,
  match,
  behandlingstema,
  redigerbart,
  fagsak,
  oppsummering,
  person,
  oppholdsland,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  oppdaterBehandlingsStatus,
  location,
  lastInnSaksopplysninger,
  resetSaksopplysninger,
  hentBehandlingsgrunnlag,
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

  const ikkeYrkesaktiv = behandlingstema === MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;
  useEffect(() => {
    if (ikkeYrkesaktiv) {
      hentBehandlingsgrunnlag(behandlingID);
    }
  }, [behandlingstema]);

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
              behandlingstema={behandlingstema}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              oppholdsland={ikkeYrkesaktiv ? oppholdsland : []}
              behandlingsgrunnlagPeriodeFom={ikkeYrkesaktiv ? behandlingsgrunnlagPeriodeFom : undefined}
              behandlingsgrunnlagPeriodeTom={ikkeYrkesaktiv ? behandlingsgrunnlagPeriodeTom : undefined}
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
              redigerbart={sideDialogRedigerbart}
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
  sideDialogRedigerbart: PT.bool.isRequired,
  match: PT.object.isRequired,
  behandlingstema: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  oppdaterBehandlingsStatus: PT.func.isRequired,
  location: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
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
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

const mapStateToProps = state => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  oppholdsland: behandlingsgrunnlagSelectors.OppholdsLandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
  sideDialogRedigerbart: redigerbartSelectors.SidedialogRedigerbartSelector(state),
});

const mapDispatchToProps = dispatch => ({
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysningerSedBehandling(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentBehandlingsgrunnlag: behandlingID => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SedBehandling);
