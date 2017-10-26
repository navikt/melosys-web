import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import { Row, Column } from 'nav-frontend-grid';

import './sideOppsummering.css';

const uuid = require('uuid/v4');

class SideOppsummering extends Component {
  static propTypes = {
    oppsummering: PT.object.isRequired,
  };

  render() {
    const {
      soknaden,
      behandlingsStatus,
      opprettet,
      oppdatert,
      behandlingsType,
      behandlingsMedlemskap,
    } = this.props.oppsummering;

    return (
      <div className="sideOppsummering panelSeksjon">
        <Panel className="saksbehandling__soknadSammendrag">
          <Row>
            <Column xs="12" md="6">
              <Undertittel className="soknadSammendrag__header">Søknad om {soknaden.soknadsType}</Undertittel>
            </Column>
            <Column xs="12" md="6">
              <Knapp>Behandlingsmeny</Knapp>
            </Column>
          </Row>
          {/* START SØKNADSSTATUS */}
          <Row>
            <Column xs="12">
              {behandlingsStatus.kode} - {behandlingsStatus.term}
            </Column>
          </Row>
          {/* SLUTT SØKNADSSTATUS */}
          {/* START ARBEIDSFORHOLD */}
          <Row>
            <Column xs="12">
              <section>
                <Normaltekst>{soknaden.arbeidsgiverUtland.oppholdsland}</Normaltekst>
                {soknaden.soknadsPerioder.map(periode => <Normaltekst key={uuid()}>Fra: {periode.fom} Til: {periode.tom} </Normaltekst>)}
              </section>
            </Column>
          </Row>
          {/* SLUTT ARBEIDSFORHOLD */}
          {/* START SØKNADSSTATUS */}
          <Row>
            <Column xs="12">
              <section>
                <Undertittel>{behandlingsType} - {behandlingsMedlemskap}</Undertittel>
                <Normaltekst>Opprettet: {opprettet}</Normaltekst>
                <Normaltekst>Opprettet: {oppdatert}</Normaltekst>
                <Normaltekst>Behandlingsstatus: {behandlingsStatus.kode} - {behandlingsStatus.term}</Normaltekst>
              </section>
            </Column>
          </Row>
          {/* SLUTT SØKNADSSTATUS */}
        </Panel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideOppsummering);
