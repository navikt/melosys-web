import React, { Component } from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { Container, Row, Column } from 'nav-frontend-grid';
import { Element } from 'nav-frontend-typografi';

import './medlemskap.css';

const uuid = require('uuid/v4');

/** Dato-område
 *
 * @param tittel
 * @param dato
 * @constructor
 */
const DatoOmrade = ({ tittel1, tittel2, dato1, dato2 }) => (
  <Row>
    <Column xs="6" className="blokk-xs"><Element>{tittel1}</Element>{dato1}</Column>
    <Column xs="6" className="blokk-xs"><Element>{tittel2}</Element>{dato2}</Column>
  </Row>
);

DatoOmrade.propTypes = {
  tittel1: PT.string.isRequired,
  tittel2: PT.string.isRequired,
  dato1: PT.string.isRequired,
  dato2: PT.string.isRequired,
};

/** MedlemskapsSeksjon inneholdet ett enkelt medlemskap. Hver søker kan ha
 * flere medlemskap. Se Confluence for definisjon av "medlemskap".
 *
 * @constructor
 */
const MedlemskapSeksjon = () => (
  <div className="medlemskap__enkelt" aria-label="Enkeltmedlemsskap">
    <Row>
      {/* START DATO RANGE */}
      <Column xs="5">
        <Container fluid>
          <DatoOmrade tittel1="Fra" dato1="01.01.17" tittel2="Til" dato2="01.01.18" />
          <DatoOmrade tittel1="Registrert" dato1="01.02.17" tittel2="Besluttet" dato2="01.02.18" />
        </Container>
      </Column>
      {/* SLUTT DATO RANGE */}

      {/* START DETALJER */}
      <Column xs="7">
        <dl>
          <dt>Lovvalgsland:</dt>
          <dd>Norge</dd>
          <dt>Periodetype:</dt>
          <dd>404 Utilgjengelig</dd>
          <dt>Status:</dt>
          <dd>Gyldig</dd>
          <dt>Statusårsak:</dt>
          <dd>-</dd>
          <dt>Grunnlagshjemmel:</dt>
          <dd>12.1</dd>
          <dt>Delingskode:</dt>
          <dd>12345</dd>
          <dt>Lovvalgsperiodetype:</dt>
          <dd>Utsendt arbeidstaker</dd>
        </dl>
      </Column>
      {/* SLUTT DETALJER */}
    </Row>
  </div>
);

class Medlemskap extends Component {
  static propTypes = {
    medlemskapsPeriode: PT.array.isRequired,
  };

  static defaultProps = {
    medlemskapsPeriode: [{ }, { }],
  };

  render() {
    return (
      <div className="medlemskap panelSeksjon">
        <EkspanderbartPanel tittel="Medlemskap">
          <section aria-label="Medlemskap">
            <Container fluid>
              {/* START MEDLEMSKAP-REPEAT */}
              {this.props.medlemskapsPeriode.map(() => <MedlemskapSeksjon key={uuid()} />)}
              {/* SLUTT MEDLEMSKAP-REPEAT */}
            </Container>
          </section>
        </EkspanderbartPanel>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Medlemskap);
