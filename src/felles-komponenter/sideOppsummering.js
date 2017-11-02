import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import EnkeltDato from './datoOmrade/enkeltDato';

import './sideOppsummering.css';

const uuid = require('uuid/v4');

function SideOppsummering(props) {
  const {
    soknaden,
    behandlingsStatus,
    opprettet,
    sistOppdatert,
    behandlingsType,
    behandlingsMedlemskap,
  } = props.oppsummering;

  return (
    <section aria-label="oppsummeringer" className="sideOppsummering panelSeksjon">
      <Nav.Panel className="saksbehandling__soknadSammendrag">
        <Nav.Row>
          <Nav.Column xs="12" md="6">
            <Nav.Undertittel className="soknadSammendrag__header">Søknad om {soknaden.soknadsType}</Nav.Undertittel>
          </Nav.Column>
          <Nav.Column xs="12" md="6">
            <Nav.Knapp>Behandlingsmeny</Nav.Knapp>
          </Nav.Column>
        </Nav.Row>
        {/* START BEHANDLINGSSTATUS */}
        <Nav.Row>
          <Nav.Column xs="12">
            <dl aria-label="opphold og periode" className="oppsummering__detaljer">
              <dt>Behandlingsstatus:</dt>
              <dd>{behandlingsStatus.kode} - {behandlingsStatus.term}</dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        {/* SLUTT BEHANDLINGSSTATUS */}
        {/* START OPPHOLDSINFORMASJON OG PERIODE */}
        <Nav.Row>
          <Nav.Column xs="12">
            <dl aria-label="opphold og periode" className="oppsummering__detaljer">
              <dt>Oppholdsland:</dt>
              <dd>{soknaden.arbeidsgiverUtland.oppholdsland}</dd>
              <dt>Oppholdsperioder:</dt>
              <dd>
                {soknaden.soknadsPerioder.map((periode, index) => (
                  <Nav.Normaltekst key={uuid()}>Periode #{index + 1}: <EnkeltDato dato={periode.fom} /> - <EnkeltDato dato={periode.tom} /></Nav.Normaltekst>
                ))}
              </dd>
            </dl>
          </Nav.Column>
        </Nav.Row>
        {/* SLUTT OPPHOLDSINFORMASJON OG PERIODE */}
        {/* START BEHANDLINGSSTATUS */}
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.Systemtittel>{behandlingsType} - {behandlingsMedlemskap}</Nav.Systemtittel>
            <dl aria-label="behandlingsinformasjon" className="oppsummering__detaljer--rad">
              <dt>Opprettet:</dt>
              <dl><EnkeltDato dato={opprettet} /></dl>
              <dt>Oppdatert:</dt>
              <dl><EnkeltDato dato={sistOppdatert} /></dl>
              <dt>Behandlingsstatus:</dt>
              <dl>{behandlingsStatus.kode} - {behandlingsStatus.term}</dl>
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
