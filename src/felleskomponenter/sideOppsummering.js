import React, { useEffect, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import MKV from "../melosyskodeverk";

import * as Nav from "../utils/navFrontend";
import * as MPT from "../proptypes";
import * as KV from "../kodeverk";
import * as Ikoner from "../resources/images";

import Oppsummering from "./oppsummering";

import "./sideOppsummering.css";
import { modalerOperations } from "../ducks/modaler";
import { behandlingstemaOperations } from "../ducks/behandlingstema";
import { behandlingsstatusOperations } from "../ducks/behandlingsstatus";
import { behandlingerSelectors } from "../ducks/behandlinger";
import { FeatureToggle } from "../featuretoggle";

const SideOppsummering = ({
  arbeidsland,
  oppholdsland,
  behandlingstema,
  fagsak,
  oppsummering,
  person,
  lovvalgsperiodeFom,
  lovvalgsperiodeTom,
  lovvalgsland,
  renderBehandlingsmeny,
  renderBehandlingsstatus,
  behandlingsgrunnlagPeriodeFom,
  behandlingsgrunnlagPeriodeTom,
  periodeLabel,
  visEndreBehandlingstemaDialogHandle,
  visEndreBehandlingsstatusDialogHandle,
  hentMuligeBehandlingstema,
  hentMuligeBehandlingsstatuser,
  behandlingID,
}) => {
  if (!oppsummering) return <div />;

  const [kanEndreBehandlingstema, setKanEndreBehandlingstema] = useState(false);
  const [kanEndrebehandlingsstatus, setKanEndrebehandlingsstatus] = useState(false);
  const tittel = KV.kodeTilTerm(behandlingstema, MKV.KTObjects.behandlinger.behandlingstema) || "";
  const behandlingsstatus = renderBehandlingsstatus();

  useEffect(() => {
    if (behandlingID > 0) {
      hentMuligeBehandlingstema(behandlingID)
        .then((response) =>
          setKanEndreBehandlingstema(
            response.data.muligeBehandlingstema && response.data.muligeBehandlingstema.length !== 0
          )
        )
        .catch(() => setKanEndreBehandlingstema(false));

      hentMuligeBehandlingsstatuser(behandlingID)
        .then((response) =>
          setKanEndrebehandlingsstatus(
            response.data.muligeBehandlingsstatuser && response.data.muligeBehandlingsstatuser.length !== 0
          )
        )
        .catch(() => setKanEndrebehandlingsstatus(false));
    }
  }, [behandlingID]);

  const behandlingsstatusLinje = (
    <FeatureToggle togglename="melosys.oversikt.ENDRING_AV_BEHANDLINGSSTATUS">
      {(status) =>
        status === "enabled" ? (
          <Nav.typo.Normaltekst
            className={kanEndrebehandlingsstatus ? "behandlingsstatus_redigerbar" : ""}
            onClick={kanEndrebehandlingsstatus ? visEndreBehandlingsstatusDialogHandle : null}
          >
            {KV.objektTilTerm(oppsummering.behandlingsstatus)}{" "}
            {kanEndrebehandlingsstatus ? (
              <Ikoner.BlyantActive className="blyant" />
            ) : (
              <Ikoner.BlyantDisabled className="blyant" />
            )}
          </Nav.typo.Normaltekst>
        ) : (
          <div>{KV.objektTilTerm(oppsummering.behandlingsstatus)}</div>
        )
      }
    </FeatureToggle>
  );

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <div className="oppsummering__menylinje">{renderBehandlingsmeny()}</div>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12" md="12">
            <Nav.typo.Undertittel
              className={kanEndreBehandlingstema ? "behandlingstema_redigerbar" : ""}
              onClick={kanEndreBehandlingstema ? visEndreBehandlingstemaDialogHandle : null}
            >
              {tittel}{" "}
              {kanEndreBehandlingstema ? (
                <Ikoner.BlyantActive className="blyant" />
              ) : (
                <Ikoner.BlyantDisabled className="blyant" />
              )}
            </Nav.typo.Undertittel>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row>
          <Nav.Column xs="12">
            {oppsummering && (
              <Oppsummering
                arbeidsland={arbeidsland}
                oppholdsland={oppholdsland}
                lovvalgsland={lovvalgsland}
                fagsak={fagsak}
                oppsummering={oppsummering}
                behandlingsstatus={behandlingsstatusLinje}
                person={person}
                lovvalgsperiodeFom={lovvalgsperiodeFom}
                lovvalgsperiodeTom={lovvalgsperiodeTom}
                behandlingsgrunnlagPeriodeFom={behandlingsgrunnlagPeriodeFom}
                behandlingsgrunnlagPeriodeTom={behandlingsgrunnlagPeriodeTom}
                periodeLabel={periodeLabel}
              />
            )}
          </Nav.Column>
        </Nav.Row>
        {behandlingsstatus && (
          <FeatureToggle togglename="melosys.oversikt.ENDRING_AV_BEHANDLINGSSTATUS">
            {(status) =>
              status === "enabled" ? null : (
                <Nav.Row>
                  <Nav.Column xs="12">{behandlingsstatus}</Nav.Column>
                </Nav.Row>
              )
            }
          </FeatureToggle>
        )}
      </Nav.Panel>
    </section>
  );
};

SideOppsummering.propTypes = {
  behandlingstema: PT.string.isRequired,
  redigerbart: PT.bool,
  fagsak: MPT.Fagsak,
  oppsummering: MPT.Behandlinger.Oppsummering,
  person: MPT.Behandlinger.Saksopplysninger.Person.isRequired,
  lovvalgsperiodeFom: PT.string,
  lovvalgsperiodeTom: PT.string,
  lovvalgsland: MPT.Kodeverk,
  renderBehandlingsmeny: PT.func.isRequired,
  renderBehandlingsstatus: PT.func.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk),
  oppholdsland: PT.arrayOf(MPT.Kodeverk),
  behandlingsgrunnlagPeriodeFom: PT.string,
  behandlingsgrunnlagPeriodeTom: PT.string,
  periodeLabel: PT.string,
  visEndreBehandlingstemaDialogHandle: PT.func.isRequired,
  visEndreBehandlingsstatusDialogHandle: PT.func.isRequired,
  hentMuligeBehandlingstema: PT.func.isRequired,
  hentMuligeBehandlingsstatuser: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
};

SideOppsummering.defaultProps = {
  lovvalgsland: {},
  arbeidsland: [],
  oppholdsland: [],
  redigerbart: false,
  fagsak: undefined,
  oppsummering: undefined,
  lovvalgsperiodeFom: undefined,
  lovvalgsperiodeTom: undefined,
  behandlingsgrunnlagPeriodeFom: undefined,
  behandlingsgrunnlagPeriodeTom: undefined,
  periodeLabel: "Søknadsperiode",
};

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  visEndreBehandlingstemaDialogHandle: () => dispatch(modalerOperations.visEndreBehandlingstema()),
  visEndreBehandlingsstatusDialogHandle: () => dispatch(modalerOperations.visEndreBehandlingsstatus()),
  hentMuligeBehandlingstema: (behandlingID) =>
    dispatch(behandlingstemaOperations.hentMuligeBehandlingstema(behandlingID)),
  hentMuligeBehandlingsstatuser: (behandlingID) =>
    dispatch(behandlingsstatusOperations.hentMuligeBehandlingsstatuser(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
