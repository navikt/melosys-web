import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import PT from "prop-types";

import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Routing from "../../routing";

import PanelHeader from "../panelHeader";
import EnkeltDato from "../enkeltDato";
import { BehandlingsstatusMedSvarfrist } from "../behandlingsstatus";
import Soknadsland from "../soknadsland";

import { formatterDatoTilNorsk } from "../../utils/dato";

import "./behandlingOppgave.css";

const BehandlingOppgavesLinjeWrapper = ({ link, stengt, children }) =>
  stengt ? (
    <div>{children}</div>
  ) : (
    <Link to={link} className="behandlingOppgave__link">
      {children}
    </Link>
  );

BehandlingOppgavesLinjeWrapper.propTypes = {
  link: PT.string.isRequired,
  stengt: PT.bool.isRequired,
  children: PT.node.isRequired,
};

/**
 * Dette er enkeltlinjen for én sak som inneholder sakstittel og metadata
 * for å gi saksbehandler en hent over sakens innhold før hun klikker
 * seg inn på den.
 */
const BehandlingOppgave = ({ sak, visSakstema, landkoder }) => {
  const { navn, sakstype, saksnummer, sakstema, behandling, aktivTil, land, hovedpartIdent } = sak;
  const {
    behandlingID,
    erUnderOppdatering,
    behandlingsstatus,
    behandlingstema,
    behandlingstype,
    registrertDato,
    endretDato,
    svarFrist,
  } = behandling;

  const tittel = `${navn} - ${hovedpartIdent}`;
  const link = Routing.lagUrl(saksnummer, behandlingID, behandlingstema.kode);
  const oppdateringStatus = erUnderOppdatering && "(oppdateres nå)";

  const cl = classNames({
    behandlingOppgave: true,
    behandlingOppgave__stengt: erUnderOppdatering,
  });

  return (
    <BehandlingOppgavesLinjeWrapper link={link} stengt={erUnderOppdatering}>
      <Nav.Panel data-cy-behandlingstema={behandlingstema.kode} className={cl}>
        <PanelHeader tittel={tittel} />
        <div className="behandlingOppgave__info">
          <Nav.Row>
            <Nav.Column xs="7" className="behandlingOppgave__uthevetKolonne">
              {visSakstema ? (
                <Nav.Row className="infoTerm">
                  {KV.objektTilTerm(sakstype) || "(ukjent)"} - {KV.objektTilTerm(sakstema) || "(ukjent)"}
                </Nav.Row>
              ) : (
                <Nav.Row className="infoTerm">{KV.objektTilTerm(sakstype) || "(ukjent)"}</Nav.Row>
              )}
              <Nav.Row className="infoTerm">{KV.objektTilTerm(behandlingstema) || "(ukjent)"}</Nav.Row>
              <Nav.Row className="infoTerm">{KV.objektTilTerm(behandlingstype) || "(ukjent)"}</Nav.Row>
            </Nav.Column>

            <Nav.Column xs="4" className="behandlingOppgave__kolonne">
              <Nav.Row className="behandlingOppgave__statusOgFrist">
                <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={svarFrist} />
              </Nav.Row>
              <Nav.Row>
                <Nav.Column className="infoTerm">Frist:</Nav.Column>
                <Nav.Column className="infoDetalj">
                  <EnkeltDato dato={aktivTil} />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column className="infoTerm">Land:</Nav.Column>
                <Nav.Column className="infoDetalj">
                  <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
                </Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column className="infoTerm">Opprettelsesdato:</Nav.Column>
                <Nav.Column className="infoDetalj">{<EnkeltDato dato={registrertDato} /> || "(ukjent)"}</Nav.Column>
              </Nav.Row>
              <Nav.Row>
                <Nav.Column className="infoTerm">Sist oppdatert:</Nav.Column>
                <Nav.Column className="infoDetalj">{oppdateringStatus || formatterDatoTilNorsk(endretDato)}</Nav.Column>
              </Nav.Row>
            </Nav.Column>
          </Nav.Row>
        </div>
      </Nav.Panel>
    </BehandlingOppgavesLinjeWrapper>
  );
};

BehandlingOppgave.propTypes = {
  sak: MPT.SaksbehandlingOppgave,
  visSakstema: PT.bool.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

BehandlingOppgave.defaultProps = {
  sak: {},
};

export default BehandlingOppgave;
