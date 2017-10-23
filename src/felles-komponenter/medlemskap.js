import React from 'react';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';

import * as MPT from '../proptypes';
import './medlemskap.css';

const uuid = require('uuid/v4');

/** Dato-område
 *
 * @param tittel
 * @param dato
 * @constructor
 */
const DatoOmrade = ({ tittel1, tittel2, dato1, dato2 }) => (
  <Nav.Row>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>{tittel1}</Nav.Element>{dato1}</Nav.Column>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>{tittel2}</Nav.Element>{dato2}</Nav.Column>
  </Nav.Row>
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
function MedlemskapSeksjon() {
  // const { periode, dato } = seksjon;
  return (
    <div className="medlemskap__enkelt" aria-label="Enkeltmedlemsskap">
      <Nav.Row>
        {/* START DATO RANGE */}
        <Nav.Column xs="5">
          <Nav.Container fluid>
            <DatoOmrade tittel1="Fra" dato1="2010-10-12" tittel2="Til" dato2="2015-10-12" />
            <DatoOmrade tittel1="Registrert" dato1="2010-10-14" tittel2="Besluttet" dato2="2010-10-28" />
          </Nav.Container>
        </Nav.Column>
        {/* SLUTT DATO RANGE */}

        {/* START DETALJER */}
        <Nav.Column xs="7">
          <dl className="medlemskap__detaljer">
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
        </Nav.Column>
        {/* SLUTT DETALJER */}
      </Nav.Row>
    </div>
  );
}

MedlemskapSeksjon.propTypes = {
  seksjon: MPT.MedlemskapPeriode.isRequired,
};

function Medlemskap({ medlemsskap }) {
  const { periodeListe } = medlemsskap;
  return (
    <div className="medlemskap panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Medlemskap">
        <section aria-label="Medlemskap">
          <Nav.Container fluid>
            {/* START MEDLEMSKAP-REPEAT */}
            {periodeListe.map(periode => <MedlemskapSeksjon key={uuid()} seksjon={periode} />)}
            {/* SLUTT MEDLEMSKAP-REPEAT */}
          </Nav.Container>
        </section>
      </Nav.EkspanderbartPanel>
    </div>
  );
}

Medlemskap.propTypes = {
  medlemsskap: MPT.Medlemskap.isRequired,
};

export default Medlemskap;
