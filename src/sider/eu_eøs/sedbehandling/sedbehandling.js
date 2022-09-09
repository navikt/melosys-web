import React, { useEffect } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";

import Informasjonlinje from "../../../felleskomponenter/informasjonlinje";
import SideDialog from "../../../felleskomponenter/sideDialog";
import Oppsummering from "../../../felleskomponenter/oppsummering";
import SaksoversiktLenke from "../../../felleskomponenter/saksoversiktLenke";
import { TomFlytMelding } from "../../../felleskomponenter/alertmeldinger";
import { SoknadMenypanelForm } from "../../../felleskomponenter/menypanelForm";
import { useFeatureToggle } from "../../../featuretoggle";

import { fagsakSelectors } from "../../../ducks/fagsaker";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { datalastingOperations } from "../../../ducks/datalasting";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";

import "./sedbehandling.css";

const SedBehandling = ({
  match,
  behandlingstema,
  redigerbart,
  fagsak,
  oppsummering,
  lovvalgsland,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  location,
  lastInnSaksopplysninger,
  resetSaksopplysninger,
  hentBehandlingsgrunnlag,
}) => {
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
      hentBehandlingsgrunnlag(behandlingID);
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
                  oppsummering={oppsummering}
                  fagsak={fagsak}
                  lovvalgsland={behandlingstemaErIkkeYrkesaktiv ? lovvalgsland : null}
                  lovvalgsperiodeFom={lovvalgsperiodeFom}
                  lovvalgsperiodeTom={lovvalgsperiodeTom}
                  behandlingsgrunnlagPeriodeFom={
                    behandlingstemaErIkkeYrkesaktiv ? behandlingsgrunnlagPeriodeFom : undefined
                  }
                  behandlingsgrunnlagPeriodeTom={
                    behandlingstemaErIkkeYrkesaktiv ? behandlingsgrunnlagPeriodeTom : undefined
                  }
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

SedBehandling.propTypes = {
  match: PT.object.isRequired,
  behandlingstema: PT.string.isRequired,
  redigerbart: PT.bool.isRequired,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  lovvalgsland: MPT.Kodeverk.isRequired,
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  location: PT.object.isRequired,
  lastInnSaksopplysninger: PT.func.isRequired,
  resetSaksopplysninger: PT.func.isRequired,
  hentBehandlingsgrunnlag: PT.func.isRequired,
  behandlingOppfriskes: PT.bool.isRequired,
};

SedBehandling.defaultProps = {
  fagsak: undefined,
  oppsummering: undefined,
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
};

const mapStateToProps = (state) => ({
  fagsak: fagsakSelectors.FagsakSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  lovvalgsland: behandlingerSelectors.LovvalgslandSelector(state),
  behandlingsgrunnlagPeriodeFom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).fom
  ),
  behandlingsgrunnlagPeriodeTom: Utils.dato.formatterDatoTilNorsk(
    behandlingsgrunnlagSelectors.PeriodeSelector(state).tom
  ),
  lovvalgsperiodeFom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeFomSelector(state)),
  lovvalgsperiodeTom: Utils.dato.formatterDatoTilNorsk(behandlingerSelectors.LovvalgsperiodeTomSelector(state)),
});

const mapDispatchToProps = (dispatch) => ({
  lastInnSaksopplysninger: (saksnummer, behandlingID) =>
    dispatch(datalastingOperations.lastInnSaksopplysningerSedBehandling(saksnummer, behandlingID)),
  resetSaksopplysninger: () => dispatch(datalastingOperations.resetSaksopplysninger()),
  hentBehandlingsgrunnlag: (behandlingID) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SedBehandling);
