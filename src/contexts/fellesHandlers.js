import React, { useState } from "react";
import { connect } from "react-redux";
import { stringify } from "qs";
import { withRouter } from "react-router-dom";
import PT from "prop-types";

import * as Utils from "../utils";
import * as Api from "../services/api";

import { fagsakSelectors } from "../ducks/fagsaker";
import { datalastingOperations } from "../ducks/datalasting";
import { behandlingsgrunnlagOperations } from "../ducks/behandlingsgrunnlag";
import { oppgaverOperations } from "../ducks/oppgaver";
import { vedtakOperations } from "../ducks/vedtak";
import { saksopplysningerOperations } from "../ducks/saksopplysninger";
import { behandlingerOperations } from "../ducks/behandlinger";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import { navigeringOperations } from "../ducks/navigering";
import { lovvalgsperioderOperations } from "../ducks/lovvalgsperioder";
import { anmodningsperioderOperations } from "../ducks/anmodningsperioder";
import { utpekingsperioderOperations } from "../ducks/utpekingsperioder";

const FellesHandlersContext = React.createContext({});
export default FellesHandlersContext;

const FellesHandlersProviderUnconnected = ({
  children,
  location,
  history,
  lagreAllData,
  tilbakeleggeOppgave,
  lastInnSaksopplysninger,
  oppfriskSaksopplysninger,
  lagreBehandlingsgrunnlag,
  saksnummer,
  sakstype,
  apneTidligereBehandlinger,
  avslaaSoknad,
  skjulOppfriskDialogHandle,
  skjulHenleggDialogHandle,
  skjulAvsluttSakSomBortfaltDialogHandle,
  skjulRevurderFagsakDialogHandle,
  visOppfriskDialogHandle,
  visHenleggDialogHandle,
  visAvslagSoknadDialogHandle,
  visAvsluttSakSomBortfaltDialogHandle,
  visRevurderFagsakDialogHandle,
  visValideringModalDialogHandle,
  leggTilBehandlingOppfriskes,
  fjernBehandlingOppfriskes,
  behandlingUnderOppfriskning,
  tilForsiden,
  resetLovvalgsperioder,
  resetAnmodningsperioder,
  resetUtpekingsperioder,
}) => {
  const [venterPaRevurderFagsak, setVenterPaRevurderFagsak] = useState(false);
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

  const lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    await lagreBehandlingsgrunnlag();
    await oppfriskSaksopplysninger(behandlingID);
    await fjernBehandlingOppfriskes();
    await lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
  };

  const startOgVisOppfriskModal = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    visOppfriskDialogHandle();
    await oppfriskSaksopplysninger(behandlingID);
    await fjernBehandlingOppfriskes();
    await lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
  };

  const behandlingOppfriskes = behandlingUnderOppfriskning === behandlingID;

  const annenBehandlingOppfriskes = behandlingUnderOppfriskning !== null && !behandlingOppfriskes;

  const tilOpprettNySak = () => {
    history.push("/opprettnysak");
  };

  const skjulOppfriskModalOgNavigerTilForside = () => {
    skjulOppfriskDialogHandle();
    tilForsiden();
  };

  const lagreOgLukk = async () => {
    await lagreAllData(sakstype);
    tilForsiden();
  };

  const debouncedSetVenterPaVurderFagsak = Utils._debounce(() => setVenterPaRevurderFagsak(true), 500);

  const revurderFagsak = async () => {
    debouncedSetVenterPaVurderFagsak();

    try {
      const res = await Api.Fagsaker.fagsak.revurder(saksnummer);
      const { behandlingID: nyBehandlingID } = res;

      history.replace(`${location.pathname}?${stringify({ behandlingID: nyBehandlingID })}`);
      lastInnSaksopplysninger(sakstype, saksnummer, nyBehandlingID);
    } finally {
      debouncedSetVenterPaVurderFagsak.cancel();
      setVenterPaRevurderFagsak(false);
    }

    skjulRevurderFagsakDialogHandle();
  };

  const tilbakeleggOppgave = async () => {
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    lagreOgLukk();
  };

  const henleggSak = async (data) => Api.Fagsaker.fagsak.henlegg(saksnummer, data);

  const henleggHandle = async (data) => {
    await lagreAllData(sakstype);
    await henleggSak(data);
    skjulHenleggDialogHandle();
    tilForsiden();
  };

  const avslaaSoknadHandle = async (data) => {
    // Hvis perioden er blitt opprettet må den fjernes før avslag.
    await resetLovvalgsperioder();
    await resetAnmodningsperioder();
    await resetUtpekingsperioder();

    await lagreAllData(sakstype);
    avslaaSoknad(behandlingID, data);
  };

  const avsluttSakSomBortfalt = async () => {
    try {
      await Api.Fagsaker.fagsak.bortfall(saksnummer);
      skjulAvsluttSakSomBortfaltDialogHandle();
      tilForsiden();
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const fellesHandlers = {
    lagreOgLukk,
    tilbakeleggOppgave,
    visHenleggDialogHandle,
    visAvsluttSakSomBortfaltDialogHandle,
    visAvslagSoknadDialogHandle,
    visOppfriskModal: visOppfriskDialogHandle,
    skjulOppfriskModalOgNavigerTilForside,
    apneTidligereBehandlinger,
    tilForsiden,
    tilOpprettNySak,
    visRevurderFagsakDialogHandle,
    visValideringModalDialogHandle,
    revurderFagsak,
    henleggHandle,
    avslaaSoknadHandle,
    avsluttSakSomBortfalt,
    lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
    venterPaRevurderFagsak,
    behandlingOppfriskes,
    annenBehandlingOppfriskes,
    startOgVisOppfriskModal,
  };

  return <FellesHandlersContext.Provider value={fellesHandlers}>{children}</FellesHandlersContext.Provider>;
};

FellesHandlersProviderUnconnected.propTypes = {
  children: PT.node.isRequired,
  history: PT.object.isRequired,
  location: PT.object.isRequired,
  lagreAllData: PT.func.isRequired,
  tilbakeleggeOppgave: PT.func.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  lagreBehandlingsgrunnlag: PT.func.isRequired,
  saksnummer: PT.string,
  sakstype: PT.string,
  apneTidligereBehandlinger: PT.func.isRequired,
  avslaaSoknad: PT.func.isRequired,
  skjulOppfriskDialogHandle: PT.func.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  skjulAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  skjulRevurderFagsakDialogHandle: PT.func.isRequired,
  visOppfriskDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  visAvsluttSakSomBortfaltDialogHandle: PT.func.isRequired,
  visRevurderFagsakDialogHandle: PT.func.isRequired,
  visValideringModalDialogHandle: PT.func.isRequired,
  leggTilBehandlingOppfriskes: PT.func.isRequired,
  fjernBehandlingOppfriskes: PT.func.isRequired,
  behandlingUnderOppfriskning: PT.number,
  tilForsiden: PT.func.isRequired,
  resetLovvalgsperioder: PT.func.isRequired,
  resetAnmodningsperioder: PT.func.isRequired,
  resetUtpekingsperioder: PT.func.isRequired,
};

FellesHandlersProviderUnconnected.defaultProps = {
  behandlingUnderOppfriskning: null,
};

FellesHandlersProviderUnconnected.defaultProps = {
  saksnummer: undefined,
  sakstype: undefined,
};

const mapStateToProps = (state) => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  behandlingUnderOppfriskning: modalerSelectors.BehandlingUnderOppfriskningSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  lagreAllData: (sakstype) => dispatch(datalastingOperations.lagreAllData(sakstype)),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) =>
    oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  avslaaSoknad: (behandlingID, data) => dispatch(vedtakOperations.avslaaSoknad(behandlingID, data)),
  lastInnSaksopplysninger: (sakstype, saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysninger(sakstype, saksnummer, behandlingID)),
  oppfriskSaksopplysninger: (behandlingID) => saksopplysningerOperations.oppfrisk(behandlingID),
  leggTilBehandlingOppfriskes: (behandlingID) => dispatch(modalerOperations.leggTilBehandlingOppfriskes(behandlingID)),
  fjernBehandlingOppfriskes: () => dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  apneTidligereBehandlinger: () => dispatch(behandlingerOperations.apneTidligereBehandlinger()),
  skjulOppfriskDialogHandle: () => dispatch(modalerOperations.skjulOppfrisk()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  skjulAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.skjulAvsluttSakSomBortfalt()),
  skjulRevurderFagsakDialogHandle: () => dispatch(modalerOperations.skjulRevurderFagsak()),
  visOppfriskDialogHandle: () => dispatch(modalerOperations.visOppfrisk()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  visAvsluttSakSomBortfaltDialogHandle: () => dispatch(modalerOperations.visAvsluttSakSomBortfalt()),
  visRevurderFagsakDialogHandle: () => dispatch(modalerOperations.visRevurderFagsak()),
  visValideringModalDialogHandle: () => dispatch(modalerOperations.visValidering()),
  tilForsiden: () => dispatch(navigeringOperations.tilForsiden()),
  resetLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetAnmodningsperioder: () => dispatch(anmodningsperioderOperations.resetAnmodningsperioderState()),
  resetUtpekingsperioder: () => dispatch(utpekingsperioderOperations.resetUtpekingsperioderState()),
});

export const FellesHandlersProvider = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FellesHandlersProviderUnconnected)
);
