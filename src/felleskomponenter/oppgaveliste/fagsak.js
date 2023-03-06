import React from "react";
import PT from "prop-types";

import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Routing from "../../routing";

import Behandling from "./behandling";
import PanelHeader from "../panelHeader";
import EnkeltDato from "../enkeltDato";
import { DatoOmradeDescription } from "../datoOmrade";
import { sorterElementerEtterDato } from "../sorterbarListe";
import Soknadsland from "../soknadsland";

import "./fagsak.css";
import { useFeatureToggle } from "../../featuretoggle";

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler oversikt over sakens innhold før hun klikker
 * seg inn på den.
 */
const Fagsak = ({ sak, landkoder }) => {
  const folketrygdenToggleEnabled = useFeatureToggle("melosys.folketrygden.mvp") === "enabled";
  const ikkeYrkesaktivFlytToggleEnabled = useFeatureToggle("melosys.ikkeYrkesaktivForenkletFlyt") === "enabled";
  const registreringUnntakFraMedlemskapToggleEnabled =
    useFeatureToggle("melosys.registrering_unntak_fra_medlemskap") === "enabled";
  const { opprettetDato, sakstype, saksstatus, saksnummer, sakstema, behandlingOversikter } = sak;

  const { land } = behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.soknadsperiode != null) ?? {};
  const { lovvalgsperiode } =
    behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.lovvalgsperiode != null) ?? {};
  const link = (behandling) =>
    Routing.lagUrl(
      saksnummer,
      behandling.behandlingID,
      sakstype.kode,
      sakstema.kode,
      behandling.behandlingstema.kode,
      behandling.behandlingstype.kode,
      folketrygdenToggleEnabled,
      ikkeYrkesaktivFlytToggleEnabled,
      registreringUnntakFraMedlemskapToggleEnabled
    );

  const customMargin = { marginLeft: "1em" };

  const sorterteBehandlinger = behandlingOversikter
    .slice()
    .sort(sorterElementerEtterDato("descending", "opprettetDato"));

  return (
    <Nav.Panel className="fagsak">
      <PanelHeader tittel={`${sakstype?.term} - ${sakstema?.term}`} />
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="12" md="5">
            <dl className="fagsak__meta">
              <dt>Saksstatus:</dt>
              <dd>{KV.objektTilTerm(saksstatus, "(ukjent)")}</dd>
              <dt>Sak opprettet:</dt>
              <dd>{<EnkeltDato dato={opprettetDato} /> || "(ukjent)"}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="fagsak__meta">
              <DatoOmradeDescription label="Lovvalgsperiode: " periode={lovvalgsperiode} />
              <dt>Land:</dt>
              <dd>
                <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
              </dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="3">
            <dl style={customMargin} className="fagsak__meta">
              <dt>&nbsp;</dt>
              <dd>&nbsp;</dd>
              <dt>Saksnummer:</dt>
              <dd>{saksnummer}</dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        <Nav.Row className="fagsak__behandlinger">
          {sorterteBehandlinger.map((behandling) => (
            <Behandling key={behandling.behandlingID} behandling={behandling} link={link(behandling)} />
          ))}
        </Nav.Row>
      </Nav.Container>
    </Nav.Panel>
  );
};

Fagsak.propTypes = {
  sak: MPT.BehandligOversikt,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

Fagsak.defaultProps = {
  sak: {},
};

export default Fagsak;
