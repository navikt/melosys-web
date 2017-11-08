import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import './medlemskap.css';
import DatoOmrade from './datoOmrade/datoOmrade';
import EnkeltDato from './datoOmrade/enkeltDato';

const uuid = require('uuid/v4');

/** MedlemskapsSeksjon inneholdet ett enkelt medlemskap. Hver søker kan ha
 * flere medlemskap. Se Confluence for definisjon av "medlemskap".
 *
 * @constructor
 */
function MedlemskapPeriode({ medlemskapPeriode }) {
  const {
    type,

  } = medlemskapPeriode;

  return (
    <div className="medlemskap__enkelt" aria-label="Enkeltmedlemsskap">
      <Nav.Row>
        {/* START DATO RANGE */}
        <Nav.Column xs="6" lg="5">
          <Nav.Row>
            <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Registrert</Nav.Element></Nav.Column>
            <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Besluttet</Nav.Element></Nav.Column>
          </Nav.Row>
        </Nav.Column>
        {/* SLUTT DATO RANGE */}

        {/* START DETALJER */}
        <Nav.Column xs="12" lg="7">
          <dl className="medlemskap__detaljer">
            <dt>Lovvalgsland:</dt>
            <dd>Norge</dd>
            <dt>Periodetype:</dt>
            <dd>{type}</dd>
            <dt>Status:</dt>

          </dl>
        </Nav.Column>
        {/* SLUTT DETALJER */}
      </Nav.Row>
    </div>
  );
}

MedlemskapPeriode.propTypes = {
  medlemskapPeriode: MPT.MedlemskapPeriode.isRequired,
};

function Medlemskap({ medlemsskap }) {
  const { medlemsperiode } = medlemsskap;

  return (
    <div className="medlemskap panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Medlemskap">
        <section aria-label="Medlemskap">
          <Nav.Container fluid>
            { medlemsperiode.map(periode => <MedlemskapPeriode key={uuid()} medlemskapPeriode={periode} />) }
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
