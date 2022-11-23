import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RouteComponentProps } from "react-router-dom";

import MKV from "../../../melosyskodeverk";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import { MatchParams } from "../../../@types";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog from "../../../felleskomponenter/sideDialog";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import { TomFlytMelding } from "../../../felleskomponenter/alertmeldinger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { useFeatureToggle } from "../../../featuretoggle";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { datalastingOperations } from "../../../ducks/datalasting";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";

import "./sedbehandling.css";

const mapStateToProps = (state: RootState) => ({
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).fom
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeSelector(state).tom
  ),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lastInnSaksopplysninger: (saksnummer: string, behandlingID: number) =>
    dispatch(datalastingOperations.lastInnSaksopplysningerSedBehandling(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentMottatteOpplysninger: (behandlingID: number) => dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends RouteComponentProps<MatchParams> {
  redigerbart: boolean;
  behandlingOppfriskes: boolean;
}

const SedBehandling = ({
  match,
  behandlingstema,
  redigerbart,
  lovvalgsland,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  location,
  lastInnSaksopplysninger,
  resetSaksopplysninger,
  hentMottatteOpplysninger,
}: Props & PropsFromRedux) => {
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const {
    params: { saksnr: saksnummer },
  } = match;

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);

    return () => {
      resetSaksopplysninger();
    };
  }, []);

  const behandlingstemaErIkkeYrkesaktiv = behandlingstema === MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV;

  useEffect(() => {
    if (behandlingstemaErIkkeYrkesaktiv) {
      hentMottatteOpplysninger(behandlingID);
    }
  }, [behandlingstema]);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!behandlingstema) return null;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <div className="sedbehandling">
          <Nav.Container fluid>
            <Nav.Row>
              <Nav.Column xs="7">
                {behandleAlleSakerToggle === "enabled" && (
                  <>
                    <TomFlytMelding />
                    <SoknadMenypanelForm startOgVisOppfriskModal={() => null} visOppdaterRegisteropplysninger={false} />
                  </>
                )}
              </Nav.Column>
              <Nav.Column xs="5">
                <Oppsummering
                  lovvalgsland={behandlingstemaErIkkeYrkesaktiv ? lovvalgsland : null}
                  lovvalgsperiodeFom={lovvalgsperiodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom}
                  mottatteOpplysningerPeriodeFom={behandlingstemaErIkkeYrkesaktiv ? mottatteOpplysningerPeriodeFom : ""}
                  mottatteOpplysningerPeriodeTom={behandlingstemaErIkkeYrkesaktiv ? mottatteOpplysningerPeriodeTom : ""}
                />
                <SaksoversiktLenke />
                <SideDialog />
              </Nav.Column>
            </Nav.Row>
          </Nav.Container>
        </div>
      </div>
    </>
  );
};

export default connector(SedBehandling);
