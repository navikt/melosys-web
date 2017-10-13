import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Undertittel, Normaltekst } from 'nav-frontend-typografi';
import './personopplysninger.less';

const uuid = require('uuid/v4');

class Personopplysninger extends Component {
  static propTypes = {
    personopplysninger: PT.object,
  };
  static defaultProps = {
    personopplysninger: {
      personnummer: '01017712345',
      personnummerUtland: '111 222 333',
      adresse: 'Adresseveien 123, 1234 Adresseby, Norge',
      bostedsadresse: 'Gateadressen 99, 9999 Gateby, Norge',
      mobil: '(+47) 123 123 123',
      telefon: '(+47) 222 333 444',
      epost: 'ola.nordmann@domenet.no',
      arbeidsgiver: 'Hagemøbler AS',
      ektefelle: 'Kari Nordmann (40 år)',
      barn: ['Lea Nordmann (13 år)', 'Trym Nordmann (7 år)'],
      medfolgende: false,
    },
  };

  render() {
    const { personnummer,
      personnummerUtland,
      adresse,
      bostedsadresse,
      mobil,
      telefon,
      epost,
      arbeidsgiver,
      ektefelle,
      barn,
      medfolgende } = this.props.personopplysninger;

    return (
      <div className="personopplysninger panelSeksjon">
        <EkspanderbartPanel tittel="Ola Nordmann" apen>
          <Container fluid>
            {/* START PERSONNUMMER */}
            <Row>
              <Column xs="6">
                <section aria-label="Personnummer">
                  <Undertittel type="undertittel">Personnummer:</Undertittel>
                  <Normaltekst>{personnummer}</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section aria-label="Personnummer">
                  <Undertittel type="undertittel">Utenlandsk id:</Undertittel>
                  <Normaltekst>{personnummerUtland}</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT PERSONNUMMER */}
            {/* START ADRESSE */}
            <Row>
              <Column xs="6">
                <section arial-label="Adresse TPS">
                  <Undertittel type="undertittel">Adresse (TPS):</Undertittel>
                  <Normaltekst>{adresse}</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Bostedsadresse søker">
                  <Undertittel type="undertittel">Bostedsadresse (Søker):</Undertittel>
                  <Normaltekst>{bostedsadresse}</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT ADRESSE */}
            {/* START KONTAKTINFO */}
            <Row>
              <Column xs="6">
                <section arial-label="Kontaktinfo">
                  <Undertittel type="undertittel">Kontaktinfo:</Undertittel>
                  <Normaltekst>Mobil: {mobil}</Normaltekst>
                  <Normaltekst>Telefon: {telefon}</Normaltekst>
                  <Normaltekst>E-post: {epost}</Normaltekst>
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Arbeidstaker hos">
                  <Undertittel type="undertittel">Arbeidstaker hos:</Undertittel>
                  <Normaltekst>{arbeidsgiver}</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT KONTAKTINFO */}
            {/* START EKTEFELLE */}
            <Row>
              <Column xs="6">
                <section arial-label="Ektefelle">
                  <Undertittel type="undertittel">Ektefelle (nåværende):</Undertittel>
                  <Normaltekst>{ektefelle}</Normaltekst>
                </section>
              </Column>
            </Row>
            {/* SLUTT EKTEFELLE */}
            {/* START BARN */}
            <Row>
              <Column xs="6">
                <section arial-label="Barn">
                  <Undertittel type="undertittel">Barn:</Undertittel>
                  {barn.map(item => <Normaltekst key={uuid()}>{item}</Normaltekst>)}
                </section>
              </Column>
              <Column xs="6">
                <section arial-label="Medfølgende barn?">
                  <Undertittel type="undertittel">Medfølgende barn?</Undertittel>
                  <Normaltekst>Skal barn under 18 år oppholde seg i utlandet sammen med søkeren i perioden?</Normaltekst>
                  <Normaltekst>{medfolgende ? 'JA' : 'NEI'}</Normaltekst>
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
