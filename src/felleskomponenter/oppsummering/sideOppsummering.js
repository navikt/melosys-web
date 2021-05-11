import React, { useEffect, useState } from "react";
import PT from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import MKV from "../../melosyskodeverk";

import * as Nav from "../../utils/navFrontend";
import * as MPT from "../../proptypes";
import * as KV from "../../kodeverk";
import * as Ikoner from "../../resources/images";
import * as Modaler from "./modaler";

import Oppsummering from "./oppsummering";

import "./sideOppsummering.css";
import { behandlingstemaOperations } from "../../ducks/behandlingstema";
import { behandlingsstatusOperations } from "../../ducks/behandlingsstatus";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { FeatureToggle } from "../../featuretoggle";
import OppsummeringGammel from "./oppsummeringGammel";
import OppsummeringVerdiParRedigerbar from "./verdiPar/oppsummeringVerdiParRedigerbar";
import { formatterDatoTilNorsk } from "../../utils/dato";

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
  behandlingsgrunnlagMottaksdato,
  periodeLabel,
  hentMuligeBehandlingstema,
  hentMuligeBehandlingsstatuser,
  behandlingID,
}) => {
  if (!oppsummering) return <div />;

  const [visEndreBehandlingstema, setVisEndreBehandlingstema] = useState(false);
  const [visEndreBehandlingsstatus, setVisEndreBehandlingsstatus] = useState(false);
  const [visEndreBehandlingsfrist, setVisEndreBehandlingsfrist] = useState(false);
  const [kanEndreBehandlingstema, setKanEndreBehandlingstema] = useState(false);
  const [kanEndreBehandlingsstatus, setKanEndreBehandlingsstatus] = useState(false);

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
          setKanEndreBehandlingsstatus(
            response.data.muligeBehandlingsstatuser && response.data.muligeBehandlingsstatuser.length !== 0
          )
        )
        .catch(() => setKanEndreBehandlingsstatus(false));
    }
  }, [behandlingID]);

  const renderBehandlingsstatusLinje = (
    <FeatureToggle togglename="melosys.oversikt.ENDRING_AV_BEHANDLINGSSTATUS">
      {(statusBehandlingsstatus) =>
        statusBehandlingsstatus === "enabled" ? (
          <Nav.Typo.Normaltekst
            className={classNames({ behandlingsstatus__redigerbar: kanEndreBehandlingsstatus })}
            onClick={kanEndreBehandlingsstatus ? () => setVisEndreBehandlingsstatus(true) : null}
          >
            {KV.objektTilTerm(oppsummering.behandlingsstatus)}{" "}
            {kanEndreBehandlingsstatus ? (
              <Ikoner.BlyantActive className="blyant" />
            ) : (
              <Ikoner.BlyantDisabled className="blyant" />
            )}
          </Nav.Typo.Normaltekst>
        ) : (
          <div>{KV.objektTilTerm(oppsummering.behandlingsstatus)}</div>
        )
      }
    </FeatureToggle>
  );

  return (
    <>
      <FeatureToggle togglename="melosys.oversikt.NYTT_DESIGN">
        {(statusNyttDesign) =>
          statusNyttDesign === "enabled" ? (
            <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
              <Nav.Panel className="saksbehandling__soknadSammendrag">
                <Nav.Row>
                  <Nav.Column>{oppsummering.type}</Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    {oppsummering && (
                      <Oppsummering
                        arbeidsland={arbeidsland}
                        lovvalgsland={lovvalgsland}
                        fagsak={fagsak}
                        oppsummering={oppsummering}
                        behandlingstema={behandlingstema}
                        lovvalgsperiodeFom={lovvalgsperiodeFom}
                        lovvalgsperiodeTom={lovvalgsperiodeTom}
                        mottattDato={behandlingsgrunnlagMottaksdato}
                        behandlingsfristLinje={
                          <OppsummeringVerdiParRedigerbar
                            nokkel="Frist"
                            verdi={formatterDatoTilNorsk(oppsummering.behandlingsfrist)}
                            onClick={() => setVisEndreBehandlingsfrist(true)}
                          />
                        }
                        behandlingsstatusLinje={
                          <OppsummeringVerdiParRedigerbar
                            nokkel="Status"
                            verdi={KV.objektTilTerm(oppsummering.behandlingsstatus)}
                            redigerbart={kanEndreBehandlingsstatus}
                            onClick={() => setVisEndreBehandlingsstatus(true)}
                          />
                        }
                        behandlingstemaLinje={
                          <OppsummeringVerdiParRedigerbar
                            verdi={tittel}
                            redigerbart={kanEndreBehandlingstema}
                            onClick={() => setVisEndreBehandlingstema(true)}
                          />
                        }
                        behandlingstypeLinje={
                          // TODO: Placeholderverdier inntil MELOSYS-4387
                          <OppsummeringVerdiParRedigerbar
                            verdi={KV.objektTilTerm(oppsummering.behandlingstype)}
                            redigerbart={false}
                            onClick={() => {}}
                          />
                        }
                      />
                    )}
                  </Nav.Column>
                </Nav.Row>
                {behandlingsstatus && (
                  <FeatureToggle togglename="melosys.oversikt.ENDRING_AV_BEHANDLINGSSTATUS">
                    {(statusBehandlingsstatus) =>
                      statusBehandlingsstatus === "enabled" ? null : (
                        <Nav.Row>
                          <Nav.Column xs="12">{behandlingsstatus}</Nav.Column>
                        </Nav.Row>
                      )
                    }
                  </FeatureToggle>
                )}
              </Nav.Panel>
            </section>
          ) : (
            <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
              <Nav.Panel className="saksbehandling__soknadSammendrag">
                <Nav.Row>
                  <Nav.Column xs="12" md="12">
                    <div className="oppsummering__menylinje">{renderBehandlingsmeny()}</div>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12" md="12">
                    <Nav.Typo.Undertittel
                      className={classNames({ behandlingstema__redigerbar: kanEndreBehandlingstema })}
                      onClick={kanEndreBehandlingstema ? () => setVisEndreBehandlingstema(true) : null}
                    >
                      {tittel}{" "}
                      {kanEndreBehandlingstema ? (
                        <Ikoner.BlyantActive className="blyant" />
                      ) : (
                        <Ikoner.BlyantDisabled className="blyant" />
                      )}
                    </Nav.Typo.Undertittel>
                  </Nav.Column>
                </Nav.Row>
                <Nav.Row>
                  <Nav.Column xs="12">
                    {oppsummering && (
                      <OppsummeringGammel
                        arbeidsland={arbeidsland}
                        oppholdsland={oppholdsland}
                        lovvalgsland={lovvalgsland}
                        fagsak={fagsak}
                        oppsummering={oppsummering}
                        behandlingsstatus={renderBehandlingsstatusLinje}
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
                    {(statusBehandlingsstatus) =>
                      statusBehandlingsstatus === "enabled" ? null : (
                        <Nav.Row>
                          <Nav.Column xs="12">{behandlingsstatus}</Nav.Column>
                        </Nav.Row>
                      )
                    }
                  </FeatureToggle>
                )}
              </Nav.Panel>
            </section>
          )
        }
      </FeatureToggle>
      {visEndreBehandlingsfrist && (
        <Modaler.EndreBehandlingsfrist behandlingID={behandlingID} avbryt={() => setVisEndreBehandlingsfrist(false)} />
      )}
      {visEndreBehandlingsstatus && (
        <Modaler.EndreBehandlingsstatus avbryt={() => setVisEndreBehandlingsstatus(false)} />
      )}
      {visEndreBehandlingstema && <Modaler.EndreBehandlingstema avbryt={() => setVisEndreBehandlingstema(false)} />}
    </>
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
  behandlingsgrunnlagMottaksdato: PT.string,
  periodeLabel: PT.string,
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
  behandlingsgrunnlagMottaksdato: undefined,
  periodeLabel: "Søknadsperiode",
};

const mapStateToProps = (state) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  hentMuligeBehandlingstema: (behandlingID) =>
    dispatch(behandlingstemaOperations.hentMuligeBehandlingstema(behandlingID)),
  hentMuligeBehandlingsstatuser: (behandlingID) =>
    dispatch(behandlingsstatusOperations.hentMuligeBehandlingsstatuser(behandlingID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
