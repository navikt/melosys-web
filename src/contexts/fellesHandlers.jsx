import { createContext, useMemo } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PT from "prop-types";
import { apolloClient } from "../graphql";

import * as Utils from "../utils";

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
  lastInnSaksopplysninger,
  oppfriskSaksopplysninger,
  lagreMottatteOpplysninger,
  saksnummer,
  sakstype,
  skjulOppfriskDialogHandle,
  visOppfriskDialogHandle,
  visHenleggDialogHandle,
  visAvslagSoknadDialogHandle,
  leggTilBehandlingOppfriskes,
  fjernBehandlingOppfriskes,
  behandlingUnderOppfriskning,
  tilForsiden,
  inkluderSiste5Aar,
}) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));

  const oppfriskGraphQLSaksopplysninger = async () => {
    return apolloClient.refetchQueries({ include: "active" });
  };

  const lagreMottatteOpplysningerOgOppfriskSaksopplysninger = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    await lagreMottatteOpplysninger();
    await oppfriskSaksopplysninger(behandlingID, inkluderSiste5Aar);
    await oppfriskGraphQLSaksopplysninger();
    await lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
    await fjernBehandlingOppfriskes();
  };

  const oppfriskOgLastInnSaksopplysninger = async () => {
    await leggTilBehandlingOppfriskes(behandlingID);
    await oppfriskSaksopplysninger(behandlingID);
    await lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
    await fjernBehandlingOppfriskes();
  };

  const startOgVisOppfriskModal = async (inkluderSiste5aar) => {
    await leggTilBehandlingOppfriskes(behandlingID);
    visOppfriskDialogHandle(inkluderSiste5aar);
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

  const fellesHandlers = useMemo(
    () => ({
      visHenleggDialogHandle,
      visAvslagSoknadDialogHandle,
      visOppfriskModal: visOppfriskDialogHandle,
      skjulOppfriskModalOgNavigerTilForside,
      tilForsiden,
      tilOpprettNySak,
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
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
      oppfriskOgLastInnSaksopplysninger,
      behandlingOppfriskes,
      annenBehandlingOppfriskes,
      startOgVisOppfriskModal,
    ],
  );

  return <FellesHandlersContext.Provider value={fellesHandlers}>{children}</FellesHandlersContext.Provider>;
};

FellesHandlersProviderUnconnected.propTypes = {
  children: PT.node.isRequired,
  history: PT.object.isRequired,
  location: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  oppfriskSaksopplysninger: PT.func.isRequired,
  lagreMottatteOpplysninger: PT.func.isRequired,
  saksnummer: PT.string,
  sakstype: PT.string,
  skjulOppfriskDialogHandle: PT.func.isRequired,
  visOppfriskDialogHandle: PT.func.isRequired,
  visHenleggDialogHandle: PT.func.isRequired,
  visAvslagSoknadDialogHandle: PT.func.isRequired,
  leggTilBehandlingOppfriskes: PT.func.isRequired,
  fjernBehandlingOppfriskes: PT.func.isRequired,
  behandlingUnderOppfriskning: PT.number,
  tilForsiden: PT.func.isRequired,
  inkluderSiste5Aar: PT.bool,
};

FellesHandlersProviderUnconnected.defaultProps = {
  behandlingUnderOppfriskning: null,
  saksnummer: undefined,
  sakstype: undefined,
  inkluderSiste5Aar: false,
};

const mapStateToProps = (state) => ({
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  inkluderSiste5Aar: modalerSelectors.InkluderSiste5AarSelector(state),
  behandlingUnderOppfriskning: modalerSelectors.BehandlingUnderOppfriskningSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  lagreMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.lagre()),
  lastInnSaksopplysninger: (sakstype, saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysninger(sakstype, saksnummer, behandlingID)),
  oppfriskSaksopplysninger: (behandlingID, inkluderSiste5Aar) =>
    saksopplysningerOperations.oppfrisk(behandlingID, inkluderSiste5Aar),
  leggTilBehandlingOppfriskes: (behandlingID) => dispatch(modalerOperations.leggTilBehandlingOppfriskes(behandlingID)),
  fjernBehandlingOppfriskes: () => dispatch(modalerOperations.fjernBehandlingOppfriskes()),
  skjulOppfriskDialogHandle: () => dispatch(modalerOperations.skjulOppfrisk()),
  visOppfriskDialogHandle: (inkluderSiste5Aar) => dispatch(modalerOperations.visOppfrisk(inkluderSiste5Aar)),
  visHenleggDialogHandle: () => dispatch(modalerOperations.visHenlegg()),
  visAvslagSoknadDialogHandle: () => dispatch(modalerOperations.visAvslagSoknad()),
  tilForsiden: () => dispatch(navigeringOperations.tilForsiden()),
});

export const FellesHandlersProvider = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FellesHandlersProviderUnconnected),
);
