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
import { soknadSelectors, soknadOperations } from '../../ducks/soknad';
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
  behandlingstype,
  redigerbart,
  fagsak,
  oppsummering,
  person,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  arbeidsland,
  soknadsperiodeFom,
  soknadsperiodeTom,
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
  resetSaksopplysninger,
  oppdaterSoknad,
  lagreVilkar,
  lagreAvklartefakta,
  lagreLovvalgsperioder,
  lagreAnmodningsperioder,
  oppdaterOgLagreBehandlingsperioder,
  lagreAllData,
  tilForsiden,
  blokkerInnholdMedOppfriskSpinner,
  soknadForm,
  soknad,
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

  const soknadErKlar = !(Object.keys(soknadForm).length === 0 || Object.keys(soknad).length === 0);

  return (
    <div className="vurderutpeking">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            {
              soknadErKlar &&
              <Stegvelger
                behandlingID={behandlingID}
                stegMap={stegMap}
                lagreVilkarHandler={lagreVilkar}
                lagreAvklartefaktaHandler={lagreAvklartefakta}
                lagreLovvalgsperioderHandler={lagreLovvalgsperioder}
                lagreAnmodningsperioderHandler={lagreAnmodningsperioder}
                oppdaterOgLagreBehandlingerHandler={oppdaterOgLagreBehandlingsperioder}
                lagreAllData={lagreAllData}
                oppdaterLokalSoknadHandler={oppdaterSoknad}
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
              behandlingstype={behandlingstype}
              redigerbart={redigerbart}
              fagsak={fagsak}
              oppsummering={oppsummering}
              person={person}
              lovvalgsperiodeFom={lovvalgsperiodeFom}
              lovvalgsperiodeTom={lovvalgsperiodeTom}
              arbeidsland={arbeidsland}
              soknadsperiodeFom={soknadsperiodeFom}
              soknadsperiodeTom={soknadsperiodeTom}
              periodeLabel="Periode for SED"
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
  behandlingstype: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering.isRequired,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string.isRequired,
  lovvalgsperiodeTom: PT.string.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  soknadsperiodeFom: PT.string.isRequired,
  soknadsperiodeTom: PT.string.isRequired,
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
  resetSaksopplysninger: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppdaterSoknad: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  lagreAnmodningsperioder: PT.func.isRequired,
  oppdaterOgLagreBehandlingsperioder: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
  blokkerInnholdMedOppfriskSpinner: PT.func.isRequired,
  soknad: MPT.Soknad,
  soknadForm: PT.object.isRequired,
};

Vurderutpeking.defaultProps = {
  soknad: {},
};

const mapStateToProps = state => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).fom),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeSelector(state).tom),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).fom),
  soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(soknadSelectors.SoknadsperiodeSelector(state).tom),
  behandlingsmenyRedigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  brevBestillingRedigerbartIArtikkel13: redigerbartSelectors.BrevBestillingRedigerbartIArtikkel13Selector(state),
  soknad: soknadSelectors.SoknadSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
});

const mapDispatchToProps = dispatch => ({
  lastInnSaksopplysninger: (saksnummer, behandlingID) => dispatch(datalastingOperations.lastInnSaksopplysninger(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  oppdaterSoknad: () => dispatch(soknadOperations.oppdaterSoknadState()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.lagre()),
  lagreAnmodningsperioder: () => dispatch(anmodningsperioderOperations.lagre()),
  oppdaterOgLagreBehandlingsperioder: () => dispatch(behandlingsperioderOperations.oppdaterOgLagre()),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  oppdaterBehandlingsStatus: behandlingsstatus => dispatch(behandlingerOperations.oppdaterBehandlingsStatus(behandlingsstatus)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Vurderutpeking);
