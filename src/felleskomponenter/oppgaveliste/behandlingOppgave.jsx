import { Link } from "react-router-dom";
import classNames from "classnames";
import PT from "prop-types";

import * as MPT from "../../proptypes";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";
import * as Routing from "../../url";

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
const BehandlingOppgave = ({ sak, folketrygdenToggleEnabled, manglendeInnbetalingToggleEnabled, landkoder }) => {
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
  const link = Routing.lagUrl(
    saksnummer,
    behandlingID,
    sakstype.kode,
    sakstema.kode,
    behandlingstema.kode,
    behandlingstype.kode,
    folketrygdenToggleEnabled,
    manglendeInnbetalingToggleEnabled
  );
  const oppdateringStatus = erUnderOppdatering && "(oppdateres nå)";

  const cl = classNames({
    behandlingOppgave: true,
    behandlingOppgave__stengt: erUnderOppdatering,
  });

  const hentForsteGosysTekstblokk = (tekst) => {
    if (!tekst || !tekst.includes("\n")) {
      return tekst;
    }

    let forsteBlokk = tekst;
    const start = tekst.indexOf("---");
    if (start >= 0 && !tekst.startsWith("---")) {
      forsteBlokk = tekst.substring(0, start).trim();
    }

    if (start >= 0) {
      const andreDelimeter = tekst.indexOf("---", start + 1);
      const siste = tekst.indexOf("---", andreDelimeter + 1);
      if (siste >= 0) {
        forsteBlokk = tekst.substring(start, siste).trim();
      }
    }

    return <span>{forsteBlokk}</span>;
  };

  const reduserTekstLinjer = (tekst) => {
    return tekst?.split("\n").slice(0, 3).join("\n") || null;
  };

  return (
    <BehandlingOppgavesLinjeWrapper link={link} stengt={erUnderOppdatering}>
      <Nav.Panel data-cy-behandlingstema={behandlingstema.kode} className={cl}>
        <Nav.Row className="behandlingOppgave__info">
          <Nav.Column xs="6" md="6" lg="8">
            <Nav.Column md="12" lg="6">
              <PanelHeader tittel={`${navn} - ${hovedpartIdent}`} />
              <div className="behandlingOppgave__uthevetKolonne">
                <Nav.Row className="infoTerm">
                  {KV.objektTilTerm(sakstype, "(ukjent)")} - {KV.objektTilTerm(sakstema, "(ukjent)")}
                </Nav.Row>
                <Nav.Row className="infoTerm">{KV.objektTilTerm(behandlingstema, "(ukjent)")}</Nav.Row>
                <Nav.Row className="infoTerm">{KV.objektTilTerm(behandlingstype, "(ukjent)")}</Nav.Row>
              </div>
            </Nav.Column>

            <Nav.Column md="12" lg="6" className="behandlingOppgave__kolonne">
              <Nav.Row className="behandlingOppgave__statusOgFrist">
                <BehandlingsstatusMedSvarfrist behandlingsstatus={behandlingsstatus} svarFrist={svarFrist} />
              </Nav.Row>
              <dl className="detaljer">
                <dt className="infoTerm">Frist:</dt>
                <dd className="infoDetalj">
                  <EnkeltDato dato={aktivTil} />
                </dd>
                <dt className="infoTerm">Land:</dt>
                <dd className="infoDetalj">
                  <Soknadsland land={land} visFulltNavn landkoderKodeverk={landkoder} />
                </dd>
                <dt className="infoTerm">Opprettelsesdato:</dt>
                <dd className="infoDetalj">
                  <EnkeltDato dato={registrertDato} defaultValue="(ukjent)" />
                </dd>
                <dt className="infoTerm">Sist oppdatert:</dt>
                <dd className="infoDetalj">{oppdateringStatus || formatterDatoTilNorsk(endretDato)}</dd>
              </dl>
            </Nav.Column>
          </Nav.Column>

          <Nav.Column xs="6" md="6" lg="4" className="behandlingOppgave__kolonne__notater">
            <span>
              <b>Behandlingsnotat:</b> {reduserTekstLinjer(notat)}
            </span>
            <Nav.Row>
              <b>Gosys beskrivelseshistorikk:</b>
              <br />
              {hentForsteGosysTekstblokk(beskrivelse)}
            </Nav.Row>
          </Nav.Column>
        </Nav.Row>
      </Nav.Panel>
    </BehandlingOppgavesLinjeWrapper>
  );
};

BehandlingOppgave.propTypes = {
  sak: MPT.SaksbehandlingOppgave,
  folketrygdenToggleEnabled: PT.bool,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
};

BehandlingOppgave.defaultProps = {
  sak: {},
  folketrygdenToggleEnabled: undefined,
};

export default BehandlingOppgave;
