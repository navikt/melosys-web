import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RouteComponentProps } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import { behandlingerSelectors } from "../../ducks/behandlinger";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { datalastingOperations } from "../../ducks/datalasting";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";

import Informasjonlinje from "../../felleskomponenter/informasjonlinje";
import Oppsummering from "../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../felleskomponenter/saksoversiktLenke";
import { VirksomhetMelding, TomFlytMelding } from "../../felleskomponenter/alertmeldinger";
import SideDialog, { defaultFaner, fanerUtenBucOgSed } from "../../felleskomponenter/sideDialog";

import "./behandling.css";

const mapStateToProps = (state: RootState) => ({
  arbeidsland: behandlingsgrunnlagSelectors.SoknadslandKTSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeFomSelector(state)
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeTomSelector(state)
  ),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  fagsak: fagsakSelectors.FagsakSelector(state),
  hovedpartRolle: fagsakSelectors.HovedpartRolleSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
  mottaksdato: behandlingsgrunnlagSelectors.MottaksdatoSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  lastInnSaksopplysninger: (sakstype: string, saksnummer: string, behandlingID: number) =>
    dispatch(datalastingOperations.lastInnSaksopplysninger(sakstype, saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface MatchParams {
  saksnr: string;
  sakstype: string;
}

interface Props extends RouteComponentProps<MatchParams> {}

const Behandling = ({
  arbeidsland,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  behandlingstema,
  fagsak,
  hovedpartRolle,
  lastInnSaksopplysninger,
  location,
  lovvalgsland,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  mottaksdato,
  oppsummering,
  match: {
    params: { saksnr: saksnummer, sakstype },
  },
  redigerbart,
  resetSaksopplysninger,
}: Props & PropsFromRedux) => {
  const behandlingID = Utils._toInteger(Utils.queryString.getParam(location, "behandlingID"));
  const saksopplysningerErLastet = !!behandlingstema;

  useEffect(() => {
    lastInnSaksopplysninger(sakstype, saksnummer, behandlingID);
    return () => {
      resetSaksopplysninger();
    };
  }, []);

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
            <Nav.Column xs="7">{hovedpartErVirksomhet ? <VirksomhetMelding /> : <TomFlytMelding />}</Nav.Column>
            <Nav.Column xs="5">
              <Oppsummering
                oppsummering={oppsummering}
                fagsak={fagsak}
                arbeidsland={arbeidsland}
                lovvalgsland={lovvalgsland}
                mottattDato={mottaksdato}
                lovvalgsperiodeFom={lovvalgsperiodeFom}
                lovvalgsperiodeTom={lovvalgsperiodeTom}
                behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
                behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
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
