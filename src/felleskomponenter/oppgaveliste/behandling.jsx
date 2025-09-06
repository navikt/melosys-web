import PT from "prop-types";
import { Link } from "react-router-dom";

import { MKVUtils } from "../../melosyskodeverk";
import * as Nav from "../../navFrontend";

import Behandlingsstatus from "../behandlingsstatus";
import EnkeltDato from "../enkeltDato";

import "./behandling.less";

function BehandlingPanel({ behandling, kanVises }) {
  const { tittel, behandlingstema, behandlingsstatus, behandlingsresultattype, opprettetDato } = behandling;

  return (
    <div className="panel behandling">
      <Nav.Row>
        <Nav.Column>
          <Nav.Column xs="12" md="5">
            <dl className="behandling__meta">
              <dt>
                {behandlingstema.term} - {tittel}
              </dt>
              <dt>Opprettet:</dt>
              <dd>
                <EnkeltDato dato={opprettetDato} defaultValue="(ukjent)" />
              </dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="behandling__meta">
              <dd>
                <Behandlingsstatus behandlingsstatus={behandlingsstatus} />
              </dd>
              {MKVUtils.erAvsluttetEllerMidlertidigBeslutning(behandlingsstatus.kode) && (
                <dt>
                  <Nav.Tag variant="info" className="behandlingsresultattype">
                    {behandlingsresultattype.term}
                  </Nav.Tag>
                </dt>
              )}
            </dl>
          </Nav.Column>
        </Nav.Column>
        <Nav.Column xs="12" md="3" className="knapperad">
          <div className="knapp__container">
            {kanVises && <Nav.Button variant="secondary">Vis behandling</Nav.Button>}
          </div>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

BehandlingPanel.propTypes = {
  behandling: PT.object.isRequired,
  kanVises: PT.bool.isRequired,
};

function Behandling({ behandling, link }) {
  return (
    <Link to={link} className="behandling__link">
      <BehandlingPanel behandling={behandling} kanVises />
    </Link>
  );
}

Behandling.propTypes = {
  behandling: PT.object.isRequired,
  link: PT.string.isRequired,
};

export default Behandling;
