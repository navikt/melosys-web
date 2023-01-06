import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RouteComponentProps } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import { MatchParams } from "../../@types";

import { behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { datalastingOperations } from "../../ducks/datalasting";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import { SoknadMenypanelForm } from "../../felleskomponenter/menypanelForm";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { TomFlytMelding, VirksomhetMelding } from "../../felleskomponenter/alertmeldinger";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../felleskomponenter/sideDialog";

import "./behandling.css";

const mapStateToProps = (state: RootState) => ({
  arbeidsland: mottatteOpplysningerSelectors.SoknadslandKTSelector(state),
  mottatteOpplysningerPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeFomSelector(state)
  ),
  mottatteOpplysningerPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    mottatteOpplysningerSelectors.PeriodeTomSelector(state)
  ),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lastInnSaksopplysninger: (saksnummer: string, behandlingID: number) =>
    dispatch(datalastingOperations.lastInnSaksopplysningerTomFlyt(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends RouteComponentProps<MatchParams> {}

const Behandling = ({
  arbeidsland,
  mottatteOpplysningerPeriodeFom,
  mottatteOpplysningerPeriodeTom,
  behandlingstema,
  hovedpartRolle,
  lastInnSaksopplysninger,
  location,
  lovvalgsland,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  match: {
    params: { saksnr: saksnummer, sakstype },
  },
  redigerbart,
  resetSaksopplysninger,
}: Props & PropsFromRedux) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const saksopplysningerErLastet = !!behandlingstema;

  useEffect(() => {
    return () => {
      resetSaksopplysninger();
    };
  }, []);

  useEffect(() => {
    lastInnSaksopplysninger(saksnummer, behandlingID);
  }, [sakstype]);

  if (Utils._isNil(redigerbart)) return null;
  if (!behandlingID) return null;
  if (!saksopplysningerErLastet) return null;

  const hovedpartErVirksomhet = hovedpartRolle === MKV.Koder.aktoersroller.VIRKSOMHET;

  return (
    <>
      <Informasjonlinje />
      <div id="main-container" className="main-container">
        <Nav.Container fluid className="tomFlyt_behandling">
          <Nav.Row>
            <Nav.Column xs="7">
              {hovedpartErVirksomhet ? (
                <VirksomhetMelding />
              ) : (
                <>
                  <TomFlytMelding />
                  <SoknadMenypanelForm startOgVisOppfriskModal={() => null} visOppdaterRegisteropplysninger={false} />
                </>
              )}
            </Nav.Column>
            <Nav.Column xs="5">
              <Oppsummering
                arbeidsland={arbeidsland}
                lovvalgsland={lovvalgsland}
                lovvalgsperiodeFom={lovvalgsperiodeFom}
                lovvalgsperiodeTom={lovvalgsperiodeTom}
                mottatteOpplysningerPeriodeFom={mottatteOpplysningerPeriodeFom}
                mottatteOpplysningerPeriodeTom={mottatteOpplysningerPeriodeTom}
              />
              <SaksoversiktLenke />
              <SideDialog faner={hovedpartErVirksomhet ? fanerUtenBucOgSed : defaultFaner} />
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </div>
    </>
  );
};

export default connector(Behandling);
