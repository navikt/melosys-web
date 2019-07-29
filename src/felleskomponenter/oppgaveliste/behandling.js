import React from 'react';
import PT from 'prop-types';
import { Link } from 'react-router-dom';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../utils/navFrontend';
import * as KV from '../../kodeverk';
import EnkeltDato from '../datoOmrade/enkeltDato';

import './behandling.css';

const BehandlingPanel = ({ behandling, kanVises }) => {
  const { behandlingstype, behandlingsstatus, opprettetDato } = behandling;

  return (
    <Nav.Panel className="behandling">
      <Nav.Row>
        <Nav.Column>
          <Nav.Column xs="12" md="5">
            <dl className="behandling__meta">
              <dt>Behandlingstype:</dt>
              <dd>{KV.objektTilTerm(behandlingstype) || '(ukjent)'}</dd>
              <dt>Opprettelsesdato:</dt>
              <dd>{<EnkeltDato dato={opprettetDato} /> || '(ukjent)'}</dd>
            </dl>
          </Nav.Column>
          <Nav.Column xs="12" md="4">
            <dl className="behandling__meta">
              <dt>Behandlingsstatus:</dt>
              <dd>{KV.objektTilTerm(behandlingsstatus) || '(ukjent)'}</dd>
            </dl>
          </Nav.Column>
        </Nav.Column>
        <Nav.Column xs="12" md="3">
          {
            kanVises &&
            <Nav.Knapp>VIS BEHANDLING</Nav.Knapp>
          }
        </Nav.Column>
      </Nav.Row>
    </Nav.Panel>
  );
};

BehandlingPanel.propTypes = {
  behandling: PT.object.isRequired,
  kanVises: PT.bool.isRequired,
};

// Er ikke mulig å vise behandlinger med type REGISTRERING_UNNTAK_NORSK_TRYGD
const behandlingKanVises = type => KV.objektTilKode(type) !== MKV.Koder.behandlinger.typer.REGISTRERING_UNNTAK_NORSK_TRYGD;

const Behandling = ({ behandling, link }) => (
  behandlingKanVises(behandling.behandlingstype) ?
    <Link to={link} className="behandling__link">
      <BehandlingPanel behandling={behandling} kanVises />
    </Link>
    :
    <BehandlingPanel behandling={behandling} kanVises={false} />
);

Behandling.propTypes = {
  behandling: PT.object.isRequired,
  link: PT.string.isRequired,
};


export default Behandling;
