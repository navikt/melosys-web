import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Utils from '../../utils';
import * as MPT from '../../proptypes';

import SideDialog from '../../felleskomponenter/sideDialog/sideDialog';
import SideOppsummering from '../../felleskomponenter/sideOppsummering';
import Behandlingsstatus from '../../felleskomponenter/behandlingsstatus';
import Soknadpaneler from '../../felleskomponenter/soknadpaneler';
import Stegvelger from '../../felleskomponenter/stegvelger';
import Behandlingsmeny from './komponenter/behandlingsmeny';

import { formSelectors } from '../../ducks/form';
import { redigerbartSelectors } from '../../ducks/redigerbart';
import { fagsakSelectors } from '../../ducks/fagsaker';
import { behandlingerSelectors, behandlingerOperations } from '../../ducks/behandlinger';
import { datalastingOperations } from '../../ducks/datalasting';
import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from '../../ducks/behandlingsgrunnlag';
import { vilkarOperations } from '../../ducks/vilkar';
import { avklartefaktaSelectors, avklartefaktaOperations } from '../../ducks/avklartefakta';
import { anmodningsperioderOperations } from '../../ducks/anmodningsperioder';
import { lovvalgsperioderOperations } from '../../ducks/lovvalgsperioder';
import { behandlingsperioderOperations } from '../../ducks/behandlingsperioder';

import stegMap from './stegMap';
import MKV from '../../melosyskodeverk';

import './vurderutpeking.css';

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
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [],
};

const Vurderutpeking = ({
  lastInnSaksopplysninger,
  match,
  location,
  behandlingstema,
  redigerbart,
  fagsak,
  oppsummering,
  person,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  arbeidsland,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  behandlingsmenyRedigerbart,
  lagreOgLukk,
  tilbakeleggOppgave,
  visHenleggDialogHandle,
  apneTidligereBehandlinger,
  visAvsluttSakSomBortfaltDialogHandle,
  visAvslagSoknadDialogHandle,
  visOppfriskBekreftelse,
  visRevurderVedtakDialogHandle,
  oppdaterBehandlingsStatus,
  brevBestillingRedigerbart,
  brevBestillingRedigerbartIArtikkel13,
  sideDialogRedigerbart,
  resetSaksopplysninger,
  oppdaterBehandlingsgrunnlag,
  lagreVilkar,
  lagreAvklartefakta,
  lagreLovvalgsperioder,
  lagreAnmodningsperioder,
  oppdaterOgLagreBehandlingsperioder,
  lagreAllData,
  tilForsiden,
  blokkerInnholdMedOppfriskSpinner,
  soknadForm,
  behandlingsgrunnlag,
}) => {
  const { params: { snr: saksnummer } } = match;
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, 'behandlingID'));

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
    return () => {
      resetSaksopplysninger();
    };
  }, []);

  if (!behandlingID || Utils._isNil(redigerbart)) {
    return null;
  }

  const behandlingsgrunnlagErKlart = !(Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0);

  return (
    <div className="vurderutpeking">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            {
              behandlingsgrunnlagErKlart &&
              <Stegvelger
                behandlingID={behandlingID}
                stegMap={stegMap}
                lagreVilkarHandler={lagreVilkar}
                lagreAvklartefaktaHandler={lagreAvklartefakta}
                lagreLovvalgsperioderHandler={lagreLovvalgsperioder}
                lagreAnmodningsperioderHandler={lagreAnmodningsperioder}
                oppdaterOgLagreBehandlingerHandler={oppdaterOgLagreBehandlingsperioder}
                lagreAllData={lagreAllData}
                oppdaterLokalSoknadHandler={oppdaterBehandlingsgrunnlag}
                begrunnelser={MKV.KTObjects.begrunnelser}
                landkoder={MKV.KTObjects.landkoder}
                tilForsiden={tilForsiden}
              />
            }
            <Soknadpaneler
              behandlingID={behandlingID}
              blokkerInnholdMedOppfriskSpinner={blokkerInnholdMedOppfriskSpinner}
            />
          </Nav.Column>
          <Nav.Column xs="5">
            <SideOppsummering
              behandlingstema={behandlingstema}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              arbeidsland={arbeidsland}
              behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
              behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
              periodeLabel="Periode fra SED"
              renderBehandlingsmeny={() => <Behandlingsmeny
                redigerbart={behandlingsmenyRedigerbart}
                lagreOgLukkHandle={lagreOgLukk}
                tilbakeleggeHandle={tilbakeleggOppgave}
                visHenleggDialogHandle={visHenleggDialogHandle}
                apneTidligereBehandlinger={apneTidligereBehandlinger}
                visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                visHenleggSak
                visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                visAvslagManglendeOpplysninger
                visOppfriskSaksopplysninger
                oppfriskSaksopplysningerHandle={visOppfriskBekreftelse}
                visRevurderVedtakDialogHandle={visRevurderVedtakDialogHandle}
                visRevurderVedtak
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

Vurderutpeking.propTypes = {
  lastInnSaksopplysninger: PT.func.isRequired,
  match: PT.object.isRequired,
  location: PT.object.isRequired,
  behandlingstema: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string.isRequired,
  lovvalgsperiodeTom: PT.string.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingsgrunnlagPeriodeFom: PT.string.isRequired,
  behandlingsgrunnlagPeriodeTom: PT.string.isRequired,
  behandlingsmenyRedigerbart: PT.bool.isRequired,
  lagreOgLukk: PT.func.isRequired,
  tilbakeleggOppgave: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  apneTidligereBehandlinger: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visOppfriskBekreftelse: PT.func.isRequired,
  visRevurderVedtakDialogHandle: PT.func.isRequired,
  oppdaterBehandlingsStatus: PT.func.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  brevBestillingRedigerbartIArtikkel13: PT.bool.isRequired,
  sideDialogRedigerbart: PT.bool.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppdaterBehandlingsgrunnlag: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  lagreAnmodningsperioder: PT.func.isRequired,
  oppdaterOgLagreBehandlingsperioder: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
  soknadForm: PT.object.isRequired,
};

Vurderutpeking.defaultProps = {
  behandlingsgrunnlag: {},
};

const mapStateToProps = state => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).fom),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).tom),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).fom),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom),
  behandlingsmenyRedigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  sideDialogRedigerbart: redigerbartSelectors.SidedialogRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = dispatch => ({
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysninger(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.lagre()),
  lagreAnmodningsperioder: () => dispatch(anmodningsperioderOperations.lagre()),
  oppdaterOgLagreBehandlingsperioder: () => dispatch(behandlingsperioderOperations.oppdaterOgLagre()),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Vurderutpeking);
