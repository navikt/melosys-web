import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import { Row, Column } from 'nav-frontend-grid';

import './sideOppsummering.css';

class SideOppsummering extends Component {
  static propTypes = {
    oppsummering: PT.object,
  };
  static defaultProps = {
    oppsummering: {
      soknadsType: 'A1',
      summertStatus: '123456 - Under behandling',
      arbeidsStatus: 'Arbeidsgiver',
      arbeidsLand: 'Skal til Tyskland',
      arbeidsPeriode: '20.11.17 - 15.10.18 (11 mnd)',
      behandlingsType: 'Førstegangsbehandling',
      opprettetDato: '22.09.2017',
      medlemskap: '4833 NAV Medlemsskap',
      status: 'Åpen',
      statusDetalj: 'Vurderer vilkår',
    },
  };

  render() {
    const { soknadsType,
      summertStatus,
      arbeidsStatus,
      arbeidsLand,
      arbeidsPeriode,
      behandlingsType,
      opprettetDato,
      medlemskap,
      status,
      statusDetalj } = this.props.oppsummering;

    return (
      <div className="sideOppsummering panelSeksjon">
        <Panel className="saksbehandling__soknadSammendrag">
          <Row>
            <Column xs="12" md="6">
              <Undertittel className="soknadSammendrag__header">Søknad om {soknadsType}</Undertittel>
            </Column>
            <Column xs="12" md="6">
              <Knapp>Behandlingsmeny</Knapp>
            </Column>
          </Row>
          {/* START SØKNADSSTATUS */}
          <Row>
            <Column xs="12">
              {summertStatus}
            </Column>
          </Row>
          {/* SLUTT SØKNADSSTATUS */}
          {/* START ARBEIDSFORHOLD */}
          <Row>
            <Column xs="12">
              <section>
                <Normaltekst>{arbeidsStatus}</Normaltekst>
                <Normaltekst>{arbeidsLand}</Normaltekst>
                <Normaltekst>{arbeidsPeriode}</Normaltekst>
              </section>
            </Column>
          </Row>
          {/* SLUTT ARBEIDSFORHOLD */}
          {/* START SØKNADSSTATUS */}
          <Row>
            <Column xs="12">
              <section>
                <Undertittel>{behandlingsType} - {medlemskap}</Undertittel>
                <Normaltekst>Opprettet: {opprettetDato}</Normaltekst>
                <Normaltekst>Behandlingsstatus: {status} - {statusDetalj}</Normaltekst>
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
