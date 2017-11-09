import React from 'react';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';

import './medlemskap.css';

const uuid = require('uuid/v4');

/** MedlemskapsSeksjon inneholdet ett enkelt medlemskap. Hver søker kan ha
 * flere medlemskap. Se Confluence for definisjon av "medlemskap".
 *
 * @constructor
 */
function MedlemskapPeriode({ medlemskapPeriode }) {
  const {
    type,
    status,
    grunnlagstype,
    land,
    lovvalg,
    trygdedekning,
    kildedokumenttype,
    kilde,
  } = medlemskapPeriode;

  return (
    <div className="medlemskap__enkelt" aria-label="Enkelt medlemskap">
      <Nav.Row>
        {/* START DETALJER */}
        <Nav.Column xs="12" lg="7">
          <dl className="medlemskap__detaljer">
            <dt>Periodetype:</dt>
            <dd>{type || '-'}</dd>
            <dt>Status:</dt>
            <dd>{status || '-'}</dd>
            <dt>Grunnlagstype:</dt>
            <dd>{grunnlagstype || '-'}</dd>
            <dt>Land:</dt>
            <dd>{land || '-'}</dd>
            <dt>Lovvalg:</dt>
            <dd>{lovvalg || '-'}</dd>
            <dt>Trygdedekning:</dt>
            <dd>{trygdedekning || '-'}</dd>
            <dt>Kildedokumenttype:</dt>
            <dd>{kildedokumenttype || '-'}</dd>
            <dt>Kilde:</dt>
            <dd>{kilde || '-'}</dd>

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

function Medlemskap({ medlemskap }) {
  const { medlemsperiode } = medlemskap;

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
  medlemskap: MPT.Medlemskap.isRequired,
};

export default Medlemskap;
