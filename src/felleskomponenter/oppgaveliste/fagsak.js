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

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler oversikt over sakens innhold før hun klikker
 * seg inn på den.
 */
const Fagsak = ({ sak, visSakstema, landkoder }) => {
  const { opprettetDato, sakstype, saksstatus, saksnummer, sakstema, behandlingOversikter } = sak;
  const { periode, land } = behandlingOversikter.find((behandlingOversikt) => behandlingOversikt.periode != null) ?? {}; // UX ønsker å ha periode og land vist kun en gang. på topp
  const tittel = visSakstema
    ? `${KV.objektTilTerm(sakstype)} - ${KV.objektTilTerm(sakstema)}`
    : `${KV.objektTilTerm(sakstype)}`;
  const link = (behandling) =>
    visSakstema
      ? Routing.lagUrl(
          saksnummer,
          behandling.behandlingID,
          sakstype.kode,
          sakstema.kode,
          behandling.behandlingstema.kode,
          behandling.behandlingstype.kode
        )
      : Routing.lagUrlFraBehandlingstema(saksnummer, behandling.behandlingID, behandling.behandlingstema.kode);

  const customMargin = { marginLeft: "1em" };

  const sorterteBehandlinger = behandlingOversikter
    .slice()
    .sort(sorterElementerEtterDato("descending", "opprettetDato"));

  return (
    <Nav.Panel className="fagsak">
      <PanelHeader tittel={tittel} />
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
              <DatoOmradeDescription label="Periode: " periode={periode} />
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
  visSakstema: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

Fagsak.defaultProps = {
  sak: {},
};

export default Fagsak;
