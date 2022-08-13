import React from "react";
import PT from "prop-types";
import { Link } from "react-router-dom";

import { Utils as MKVUtils } from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";
import * as KV from "../../kodeverk";

import Behandlingsstatus from "../behandlingsstatus";
import EnkeltDato from "../enkeltDato";

import "./behandling.css";

const BehandlingPanel = ({ behandling, kanVises }) => {
  const { behandlingstype, behandlingsstatus, behandlingsresultattype, opprettetDato } = behandling;

  return (
    <Nav.Panel className="behandling">
      <Nav.Row>
        <Nav.Column>
          <Nav.Column xs="12" md="5">
            <dl className="behandling__meta">
              <dt>{KV.objektTilTerm(behandlingstype) || "(ukjent)"}</dt>
              <dt>Opprettet:</dt>
              <dd>{<EnkeltDato dato={opprettetDato} /> || "(ukjent)"}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="behandling__meta">
              <dd>
                <Behandlingsstatus behandlingsstatus={behandlingsstatus} />
              </dd>
              {MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus.kode) && (
                <dt>
                  <Nav.EtikettBase type="info" className="behandlingsresultattype">
                    {behandlingsresultattype.term}
                  </Nav.EtikettBase>
                </dt>
              )}
            </dl>
          </Nav.Column>
        </Nav.Column>
        <Nav.Column xs="12" md="3" className="visBehandlingKnapp">
          {kanVises && <Nav.Knapp>Vis behandling</Nav.Knapp>}
        </Nav.Column>
      </Nav.Row>
    </Nav.Panel>
  );
};

BehandlingPanel.propTypes = {
  behandling: PT.object.isRequired,
  kanVises: PT.bool.isRequired,
};

const Behandling = ({ behandling, link }) => (
  <Link to={link} className="behandling__link">
    <BehandlingPanel behandling={behandling} kanVises />
  </Link>
);

Behandling.propTypes = {
  behandling: PT.object.isRequired,
  link: PT.string.isRequired,
};

export default Behandling;
