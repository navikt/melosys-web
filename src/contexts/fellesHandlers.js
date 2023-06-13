import React, { useMemo } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PT from "prop-types";
import { apolloClient } from "../graphql";

import * as Utils from "../utils";
import * as Api from "../services/api";

import { fagsakSelectors } from "../ducks/fagsaker";
import { datalastingOperations } from "../ducks/datalasting";
import { mottatteOpplysningerOperations } from "../ducks/mottatteOpplysninger";
import { oppgaverOperations } from "../ducks/oppgaver";
import { vedtakOperations } from "../ducks/vedtak";
import { saksopplysningerOperations } from "../ducks/saksopplysninger";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import { navigeringOperations } from "../ducks/navigering";
import { lovvalgsperioderOperations } from "../ducks/lovvalgsperioder";
import { anmodningsperioderOperations } from "../ducks/anmodningsperioder";
import { utpekingsperioderOperations } from "../ducks/utpekingsperioder";
import { tilbakemeldingOperations } from "../ducks/tilbakemelding";

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
  lagreMottatteOpplysninger,
  saksnummer,
  sakstype,
  avslaaSoknad,
  skjulOppfriskDialogHandle,
  skjulHenleggDialogHandle,
  visOppfriskDialogHandle,
  visHenleggDialogHandle,
  visAvslagSoknadDialogHandle,
  leggTilBehandlingOppfriskes,
  fjernBehandlingOppfriskes,
  behandlingUnderOppfriskning,
  tilForsiden,
  tilForsidenOgVisTilbakemelding,
  resetLovvalgsperioder,
  resetAnmodningsperioder,
  resetUtpekingsperioder,
}) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

  const oppfriskGraphQLSaksopplysninger = async () => {
    return apolloClient.refetchQueries({ include: "active" });
  };

  const lagreMottatteOpplysningerOgOppfriskSaksopplysninger = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    await lagreMottatteOpplysninger();
    await oppfriskSaksopplysninger(behandlingID);
    await oppfriskGraphQLSaksopplysninger();
    await fjernBehandlingOppfriskes();
    await lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
  };

  const oppfriskOgLastInnSaksopplysninger = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    await oppfriskSaksopplysninger(behandlingID);
    await fjernBehandlingOppfriskes();
    await lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
  };

  const startOgVisOppfriskModal = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    visOppfriskDialogHandle();
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
    await lagreAllData();
    tilForsiden();
  };

  const tilbakeleggOppgave = async () => {
    const venterPaaDokumentasjon = true;

    await tilbakeleggeOppgave(behandlingID, venterPaaDokumentasjon);
    lagreOgLukk();
  };

  const henleggSak = async (data) => Api.Fagsaker.fagsak.henlegg(saksnummer, data);

  const henleggHandle = async (data) => {
    await lagreAllData();
    await henleggSak(data);
    skjulHenleggDialogHandle();
    tilForsidenOgVisTilbakemelding();
  };

  const avslaaSoknadHandle = async (data) => {
    // Hvis perioden er blitt opprettet må den fjernes før avslag.
    await resetLovvalgsperioder();
    await resetAnmodningsperioder();
    await resetUtpekingsperioder();

    await lagreAllData();
    avslaaSoknad(behandlingID, data);
  };

  const fellesHandlers = useMemo(
    () => ({
      lagreOgLukk,
      tilbakeleggOppgave,
      visHenleggDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskModal: visOppfriskDialogHandle,
      skjulOppfriskModalOgNavigerTilForside,
      tilForsiden,
      tilOpprettNySak,
      henleggHandle,
      avslaaSoknadHandle,
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
      oppfriskOgLastInnSaksopplysninger,
      behandlingOppfriskes,
      annenBehandlingOppfriskes,
      startOgVisOppfriskModal,
    }),
    [
      lagreOgLukk,
      tilbakeleggOppgave,
      visHenleggDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskDialogHandle,
      skjulOppfriskModalOgNavigerTilForside,
      tilForsiden,
      tilOpprettNySak,
      henleggHandle,
      avslaaSoknadHandle,
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
      oppfriskOgLastInnSaksopplysninger,
      behandlingOppfriskes,
      annenBehandlingOppfriskes,
      startOgVisOppfriskModal,
    ]
  );

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
  lagreMottatteOpplysninger: PT.func.isRequired,
  saksnummer: PT.string,
  sakstype: PT.string,
  avslaaSoknad: PT.func.isRequired,
  skjulOppfriskDialogHandle: PT.func.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  visOppfriskDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  leggTilBehandlingOppfriskes: PT.func.isRequired,
  fjernBehandlingOppfriskes: PT.func.isRequired,
  behandlingUnderOppfriskning: PT.number,
  tilForsiden: PT.func.isRequired,
  tilForsidenOgVisTilbakemelding: PT.func.isRequired,
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
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
  lagreMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.lagre()),
  tilbakeleggeOppgave: (oppgaveID, venterPaaDokumentasjon) =>
    oppgaverOperations.tilbakelegg(oppgaveID, venterPaaDokumentasjon),
  avslaaSoknad: (behandlingID, data) => dispatch(vedtakOperations.avslaaSoknad(behandlingID, data)),
  lastInnSaksopplysninger: (sakstype, saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysninger(sakstype, saksnummer, behandlingID)),
  oppfriskSaksopplysninger: (behandlingID) => saksopplysningerOperations.oppfrisk(behandlingID),
  leggTilBehandlingOppfriskes: (behandlingID) => dispatch(modalerOperations.leggTilBehandlingOppfriskes(behandlingID)),
  fjernBehandlingOppfriskes: () => dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulOppfriskDialogHandle: () => dispatch(modalerOperations.skjulOppfrisk()),
  skjulHenleggDialogHandle: () => dispatch(modalerOperations.skjulHenlegg()),
  visOppfriskDialogHandle: () => dispatch(modalerOperations.visOppfrisk()),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  tilForsiden: () => dispatch(navigeringOperations.tilForsiden()),
  tilForsidenOgVisTilbakemelding: () => dispatch(tilbakemeldingOperations.tilForsidenOgVisTilbakemelding()),
  resetLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState()),
  resetAnmodningsperioder: () => dispatch(anmodningsperioderOperations.resetAnmodningsperioderState()),
  resetUtpekingsperioder: () => dispatch(utpekingsperioderOperations.resetUtpekingsperioderState()),
});

export const FellesHandlersProvider = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FellesHandlersProviderUnconnected)
);
