import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import EnkeltDato from './datoOmrade/enkeltDato';

import './sideOppsummering.css';

function SideOppsummering(props) {
  const {
    saksnummer,
    type,
    status,
    registrertDato,
  } = props.oppsummering;

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        <Nav.Row>
          <Nav.Column xs="12" md="6">
            <Nav.Undertittel className="soknadSammendrag__header">Søknad om {type || '-'}</Nav.Undertittel>
          </Nav.Column>
          <Nav.Column xs="12" md="6">
            <Nav.Knapp>Behandlingsmeny</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
        {/* START BEHANDLINGSSTATUS */}
        <Nav.Row>
          <Nav.Column xs="12">
            <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
              <dt>Saksnummer:</dt>
              <dd>{saksnummer || '-'}</dd>
              <dt>Behandlingsstatus:</dt>
              <dd>{status || '-'}</dd>
              <dt>Oppholdsland:</dt>
              <dd>-</dd>
              <dt>Registrert dato:</dt>
              <dd><EnkeltDato dato={registrertDato} /></dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        {/* SLUTT BEHANDLINGSSTATUS */}
      </Nav.Panel>
    </section>
  );
}

SideOppsummering.propTypes = {
  oppsummering: MPT.Oppsummering.isRequired,
};

export default SideOppsummering;
