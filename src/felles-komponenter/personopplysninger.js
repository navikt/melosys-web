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
                <section arial-label="Adresse">
                  <Undertittel type="undertittel">Adresse:</Undertittel>
                  <Normaltekst>1234546789234</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Adresse">
                  <Undertittel type="undertittel">Adresse:</Undertittel>
                  <Normaltekst>1234546789234</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT ADRESSE */}
          </Container>
        </EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Personopplysninger);
