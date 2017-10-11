import React, { Component } from 'react';
import { connect } from 'react-redux';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';

import './personopplysninger.less';

class Personopplysninger extends Component {
  static propTypes = {

  };
  static defaultProps = {
    saksbehandler: {
      navn: '',
    },
  };

  render() {
    return (
      <div className="personopplysninger">
        <EkspanderbartPanel tittel="Ola Nordmann" apen>
          <Container fluid>
            {/* START PERSONNUMMER */}
            <Row>
              <Column xs="6">
                <section aria-label="Personnummer">
                  <Undertittel type="undertittel">Personnummer:</Undertittel>
                  <Normaltekst>1234546789234</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section aria-label="Personnummer">
                  <Undertittel type="undertittel">Utenlandsk id:</Undertittel>
                  <Normaltekst>2233 4455 6677</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT PERSONNUMMER */}
            {/* START ADRESSE */}
            <Row>
              <Column xs="6">
                <section arial-label="Adresse TPS">
                  <Undertittel type="undertittel">Adresse (TPS):</Undertittel>
                  <Normaltekst>Adresseveien 123, 1234 Adresseby, Norge</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Bostedsadresse søker">
                  <Undertittel type="undertittel">Bostedsadresse (Søker):</Undertittel>
                  <Normaltekst>1234546789234</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT ADRESSE */}
            {/* START KONTAKTINFO */}
            <Row>
              <Column xs="6">
                <section arial-label="Kontaktinfo">
                  <Undertittel type="undertittel">Kontaktinfo:</Undertittel>
                  <Normaltekst>Mobil: (+47) 123 123 123</Normaltekst>
                  <Normaltekst>Telefon: (+47) 222 333 444</Normaltekst>
                  <Normaltekst>E-post: ola.nordmann@domet.no</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Arbeidstaker hos">
                  <Undertittel type="undertittel">Arbeidstaker hos:</Undertittel>
                  <Normaltekst>Hagemøbler AS</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT KONTAKTINFO */}
            {/* START EKTEFELLE */}
            <Row>
              <Column xs="6">
                <section arial-label="Ektefelle">
                  <Undertittel type="undertittel">Ektefelle (nåværende):</Undertittel>
                  <Normaltekst>Kari Nordmann (40 år)</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT EKTEFELLE */}
            {/* START BARN */}
            <Row>
              <Column xs="6">
                <section arial-label="Barn">
                  <Undertittel type="undertittel">Barn:</Undertittel>
                  <Normaltekst>Mobil: (+47) 123 123 123</Normaltekst>
                  <Normaltekst>Telefon: (+47) 222 333 444</Normaltekst>
                  <Normaltekst>E-post: ola.nordmann@domet.no</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Medfølgende barn?">
                  <Undertittel type="undertittel">Medfølgende barn?</Undertittel>
                  <Normaltekst>Skal barn under 18 år oppholde seg i utlandet sammen med søkeren i perioden?</Normaltekst>
                  <Normaltekst>Nei</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT BARN */}
          </Container>
        </EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
