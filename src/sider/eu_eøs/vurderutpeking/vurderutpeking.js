import React, { useEffect } from "react";
import { connect } from "react-redux";
import PT from "prop-types";
import { getFormValues } from "redux-form";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";

import SideDialog from "../../../felleskomponenter/sideDialog/sideDialog";
import SideOppsummering from "../../../felleskomponenter/oppsummering/sideOppsummering";
import Behandlingsstatus from "../../../felleskomponenter/behandlingsstatus";
import Stegvelger, { STEG } from "../../../felleskomponenter/stegvelger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import Legacybehandlingsmeny from "./komponenter/legacybehandlingsmeny";

import { formSelectors } from "../../../ducks/form";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { datalastingOperations } from "../../../ducks/datalasting";
import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from "../../../ducks/behandlingsgrunnlag";
import { vilkarOperations } from "../../../ducks/vilkar";
import { avklartefaktaSelectors, avklartefaktaOperations } from "../../../ducks/avklartefakta";
import { anmodningsperioderOperations } from "../../../ducks/anmodningsperioder";
import { lovvalgsperioderOperations } from "../../../ducks/lovvalgsperioder";
import { behandlingsperioderOperations } from "../../../ducks/behandlingsperioder";

import stegMap from "./stegMap";
import MKV from "../../../melosyskodeverk";
import { dokumenterSelectors } from "../../../ducks/dokumenter";

import "./vurderutpeking.css";

const { AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING } = MKV.Koder.behandlinger.behandlingsstatus;

const behandlingsstatusMap = {
  [MKV.Koder.behandlinger.behandlingsstatus.VURDER_DOKUMENT]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_PART,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_PART]: [
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
      term: MKV.Terms.behandlinger.behandlingsstatus.AVVENT_DOK_UTL,
    },
    {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
      term: MKV.Terms.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    },
  ],
  [MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING]: [],
};

const hentForsteSteg = (behandlingstema) => {
  switch (behandlingstema) {
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND:
      return STEG.VURDER_UTPEKING;
    case MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE:
    default:
      return STEG.INNGANG;
  }
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
  visRevurderFagsakDialogHandle,
  brevBestillingRedigerbart,
  resetSaksopplysninger,
  oppdaterBehandlingsgrunnlag,
  lagreVilkar,
  lagreAvklartefakta,
  lagreLovvalgsperioder,
  lagreAnmodningsperioder,
  oppdaterOgLagreBehandlingsperioder,
  lagreAllData,
  tilForsiden,
  startOgVisOppfriskModal,
  soknadForm,
  behandlingsgrunnlag,
  dokumentOversikt,
  dokumenter,
  vurderUtpekingFormValues,
  behandlingsstatus,
}) => {
  const {
    params: { snr: saksnummer },
  } = match;
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);

    return () => {
      resetSaksopplysninger();
    };
  }, []);

  if (!behandlingID || Utils._isNil(redigerbart)) {
    return null;
  }

  const behandlingsgrunnlagErKlart = !(
    Object.keys(soknadForm).length === 0 || Object.keys(behandlingsgrunnlag).length === 0
  );

  const forsteSteg = hentForsteSteg(behandlingstema);

  const lovvalgslandFraForm = vurderUtpekingFormValues.lovvalgsland;
  const visLovvalgsland = lovvalgslandFraForm && lovvalgslandFraForm !== MKV.Koder.landkoder.NO;
  const lovvalgslandKTOBject = visLovvalgsland
    ? KV.kodeTilObjekt(lovvalgslandFraForm, MKV.KTObjects.landkoder)
    : undefined;

  const behandlingErAvsluttet = [AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING].includes(behandlingsstatus);
  const visRevurderFagsak = behandlingErAvsluttet;

  return (
    <div className="vurderutpeking">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            {behandlingsgrunnlagErKlart && (
              <Stegvelger
                behandlingID={behandlingID}
                stegMap={stegMap}
                lagreVilkarHandler={lagreVilkar}
                lagreAvklartefaktaHandler={lagreAvklartefakta}
                lagreLovvalgsperioderHandler={lagreLovvalgsperioder}
                lagreAnmodningsperioderHandler={lagreAnmodningsperioder}
                oppdaterOgLagreBehandlingerHandler={oppdaterOgLagreBehandlingsperioder}
                lagreAllData={lagreAllData}
                oppdaterBehandlingsgrunnlag={oppdaterBehandlingsgrunnlag}
                begrunnelser={MKV.KTObjects.begrunnelser}
                landkoder={MKV.KTObjects.landkoder}
                tilForsiden={tilForsiden}
                forsteSteg={forsteSteg}
              />
            )}
            <SoknadMenypanelForm startOgVisOppfriskModal={startOgVisOppfriskModal} />
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
              lovvalgsland={lovvalgslandKTOBject}
              behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
              behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
              periodeLabel="Periode fra SED"
              renderBehandlingsmeny={() => (
                <Legacybehandlingsmeny
                  redigerbart={behandlingsmenyRedigerbart}
                  lagreOgLukkHandle={lagreOgLukk}
                  tilbakeleggeHandle={tilbakeleggOppgave}
                  visHenleggDialogHandle={visHenleggDialogHandle}
                  apneTidligereBehandlinger={apneTidligereBehandlinger}
                  visAvsluttSakSomBortfaltDialogHandle={visAvsluttSakSomBortfaltDialogHandle}
                  visHenleggSak
                  visAvslagSoknadDialogHandle={visAvslagSoknadDialogHandle}
                  visAvslagManglendeOpplysninger
                  visRevurderFagsakDialogHandle={visRevurderFagsakDialogHandle}
                  visRevurderFagsak={visRevurderFagsak}
                />
              )}
              renderBehandlingsstatus={() => (
                <Behandlingsstatus
                  behandlingID={behandlingID}
                  redigerbart={redigerbart}
                  oppsummering={oppsummering}
                  behandlingsstatusMap={behandlingsstatusMap}
                />
              )}
            />
            <SideDialog
              behandlingID={behandlingID}
              saksnummer={saksnummer}
              brevBestillingRedigerbart={brevBestillingRedigerbart}
              redigerbart={redigerbart}
              dokumentOversikt={dokumentOversikt}
              dokumenter={dokumenter}
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
  behandlingsstatus: PT.string.isRequired,
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
  visOppfriskModal: PT.func.isRequired,
  startOgVisOppfriskModal: PT.func.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
  brevBestillingRedigerbart: PT.bool.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  tilForsiden: PT.func.isRequired,
  oppdaterBehandlingsgrunnlag: PT.func.isRequired,
  lagreVilkar: PT.func.isRequired,
  lagreAvklartefakta: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  lagreAnmodningsperioder: PT.func.isRequired,
  oppdaterOgLagreBehandlingsperioder: PT.func.isRequired,
  lagreAllData: PT.func.isRequired,
  behandlingsgrunnlag: MPT.Behandlingsgrunnlag,
  soknadForm: PT.object.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
  dokumentOversikt: PT.array.isRequired,
  dokumenter: PT.array.isRequired,
  vurderUtpekingFormValues: PT.object,
};

Vurderutpeking.defaultProps = {
  behandlingsgrunnlag: {},
  vurderUtpekingFormValues: {},
};

const mapStateToProps = (state) => ({
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingsstatus: behandlingerSelectors.BehandlingsstatusKodeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  person: behandlingerSelectors.PersonSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).fom
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom
  ),
  behandlingsmenyRedigerbart: redigerbartSelectors.BehandlingsmenyRedigerbartSelector(state),
  brevBestillingRedigerbart: redigerbartSelectors.BrevBestillingRedigerbartSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  soknadForm: formSelectors.SoknadenFormSelector(state),
  dokumenter: dokumenterSelectors.AlleFysiskeDokumentSelector(state),
  dokumentOversikt: dokumenterSelectors.DokumentOversiktSelector(state),
  vurderUtpekingFormValues: getFormValues(KV.Form.VURDER_UTPEKING)(state),
});

const mapDispatchToProps = (dispatch) => ({
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysninger(MKV.Koder.sakstyper.EU_EOS, saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
  lagreVilkar: () => dispatch(vilkarOperations.lagre()),
  lagreAvklartefakta: () => dispatch(avklartefaktaOperations.lagre()),
  lagreLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.lagre()),
  lagreAnmodningsperioder: () => dispatch(anmodningsperioderOperations.lagre()),
  oppdaterOgLagreBehandlingsperioder: () => dispatch(behandlingsperioderOperations.oppdaterOgLagre()),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Vurderutpeking);
