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
  const {
    navn,
    sakstype,
    saksnummer,
    sakstema,
    behandling,
    aktivTil,
    land,
    hovedpartIdent,
    sisteNotat: notat,
    oppgaveBeskrivelse: beskrivelse,
  } = sak;
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
  const link = visSakstema
    ? Routing.lagUrl(saksnummer, behandlingID, sakstype.kode, behandlingstema.kode, behandlingstype.kode)
    : Routing.lagUrlFraBehandlingstema(saksnummer, behandlingID, behandlingstema.kode);
  const oppdateringStatus = erUnderOppdatering && "(oppdateres nå)";

  const cl = classNames({
    behandlingOppgave: true,
    behandlingOppgave__stengt: erUnderOppdatering,
  });

  const reduserTekstLengde = (tekst) => {
    const maxLengde = 60;
    return tekst != null && tekst.length > maxLengde ? `${tekst.slice(0, maxLengde)} (...)` : tekst;
  };

  return (
    <BehandlingOppgavesLinjeWrapper link={link} stengt={erUnderOppdatering}>
      <Nav.Panel data-cy-behandlingstema={behandlingstema.kode} className={cl}>
        <Nav.Row className="behandlingOppgave__info">
          <Nav.Column xs="6" md="6" lg="8">
            <PanelHeader tittel={tittel} />
            <Nav.Column md="12" lg="6" className="behandlingOppgave__uthevetKolonne">
              {visSakstema ? (
                <Nav.Row className="infoTerm">
                  {KV.objektTilTerm(sakstype, "(ukjent)")} - {KV.objektTilTerm(sakstema, "(ukjent)")}
                </Nav.Row>
              ) : (
                <Nav.Row className="infoTerm">{KV.objektTilTerm(sakstype, "(ukjent)")}</Nav.Row>
              )}
              <Nav.Row className="infoTerm">{KV.objektTilTerm(behandlingstema, "(ukjent)")}</Nav.Row>
              <Nav.Row className="infoTerm">{KV.objektTilTerm(behandlingstype, "(ukjent)")}</Nav.Row>
            </Nav.Column>

            <Nav.Column md="12" lg="6" className="behandlingOppgave__kolonne">
              <Nav.Row className="behandlingOppgave__statusOgFrist">
                <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={svarFrist} />
              </Nav.Row>
              <dl>
                <dt className="infoTerm">Frist:</dt>
                <dd className="infoDetalj">
                  <EnkeltDato dato={aktivTil} />
                </dd>
                <dt className="infoTerm">Land:</dt>
                <dd className="infoDetalj">
                  <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
                </dd>
                <dt className="infoTerm">Opprettelsesdato:</dt>
                <dd className="infoDetalj">{<EnkeltDato dato={registrertDato} /> || "(ukjent)"}</dd>
                <dt className="infoTerm">Sist oppdatert:</dt>
                <dd className="infoDetalj">{oppdateringStatus || formatterDatoTilNorsk(endretDato)}</dd>
              </dl>
            </Nav.Column>
          </Nav.Column>
          <Nav.Column xs="6" md="6" lg="4" className="behandlingOppgave__kolonne__notater">
            <Nav.Row>{reduserTekstLengde(notat)}</Nav.Row>
            <Nav.Row>
              <b>Gosys:</b>
              <br />
              {reduserTekstLengde(beskrivelse)}
            </Nav.Row>
          </Nav.Column>
        </Nav.Row>
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
