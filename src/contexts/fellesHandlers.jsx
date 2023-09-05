import { createContext, useMemo } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PT from "prop-types";
import { apolloClient } from "../graphql";

import * as Utils from "../utils";
import * as Api from "../services/api";

import { fagsakSelectors } from "../ducks/fagsaker";
import { datalastingOperations } from "../ducks/datalasting";
import { mottatteOpplysningerOperations } from "../ducks/mottatteOpplysninger";
import { saksopplysningerOperations } from "../ducks/saksopplysninger";
import { modalerOperations, modalerSelectors } from "../ducks/modaler";
import { navigeringOperations } from "../ducks/navigering";

const FellesHandlersContext = createContext({});
export default FellesHandlersContext;

const FellesHandlersProviderUnconnected = ({
  children,
  location,
  history,
  lagreAllData,
  lastInnSaksopplysninger,
  oppfriskSaksopplysninger,
  lagreMottatteOpplysninger,
  saksnummer,
  sakstype,
  skjulOppfriskDialogHandle,
  skjulHenleggDialogHandle,
  visOppfriskDialogHandle,
  visHenleggDialogHandle,
  visAvslagSoknadDialogHandle,
  leggTilBehandlingOppfriskes,
  fjernBehandlingOppfriskes,
  behandlingUnderOppfriskning,
  tilForsiden,
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

  const henleggSak = async (data) => Api.Fagsaker.fagsak.henlegg(saksnummer, data);

  const henleggHandle = async (data) => {
    await lagreAllData();
    await henleggSak(data);
    skjulHenleggDialogHandle();
    tilForsiden();
  };

  const fellesHandlers = useMemo(
    () => ({
      visHenleggDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskModal: visOppfriskDialogHandle,
      skjulOppfriskModalOgNavigerTilForside,
      tilForsiden,
      tilOpprettNySak,
      henleggHandle,
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
      oppfriskOgLastInnSaksopplysninger,
      behandlingOppfriskes,
      annenBehandlingOppfriskes,
      startOgVisOppfriskModal,
    }),
    [
      visHenleggDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskDialogHandle,
      skjulOppfriskModalOgNavigerTilForside,
      tilForsiden,
      tilOpprettNySak,
      henleggHandle,
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
  lastInnSaksopplysninger: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  lagreMottatteOpplysninger: PT.func.isRequired,
  saksnummer: PT.string,
  sakstype: PT.string,
  skjulOppfriskDialogHandle: PT.func.isRequired,
  skjulHenleggDialogHandle: PT.func.isRequired,
  visOppfriskDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  leggTilBehandlingOppfriskes: PT.func.isRequired,
  fjernBehandlingOppfriskes: PT.func.isRequired,
  behandlingUnderOppfriskning: PT.number,
  tilForsiden: PT.func.isRequired,
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
});

export const FellesHandlersProvider = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FellesHandlersProviderUnconnected)
);
