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
function MedlemskapPeriode({ medlemskapPeriode }) {
  const {
    periode,
    dato,
    status,
    helsedel,
    type,
    lovvalg,
    grunnlagstype,
    land,
    trygdedekning,
    kildedokumenttype,
    register,
  } = medlemskapPeriode;

  return (
    <div className="medlemskap__enkelt" aria-label="Enkeltmedlemsskap">
      <Nav.Row>
        {/* START DATO RANGE */}
        <Nav.Column xs="6" lg="5">
          <DatoOmrade tittel1="Fra" dato1={periode.fom} tittel2="Til" dato2={periode.tom} />
          <DatoOmrade tittel1="Registrert" dato1={dato.registrert} tittel2="Besluttet" dato2={dato.besluttet} />
        </Nav.Column>
        {/* SLUTT DATO RANGE */}

        {/* START DETALJER */}
        <Nav.Column xs="12" lg="7">
          <dl className="medlemskap__detaljer">
            <dt>Lovvalgsland:</dt>
            <dd>Norge</dd>
            <dt>Periodetype:</dt>
            <dd>{type.term}</dd>
            <dt>Status:</dt>
            <dd>{status.term}</dd>
            <dt>Helsedel:</dt>
            <dd>{helsedel ? 'JA' : 'NEI'}</dd>
            <dt>Lovvalg:</dt>
            <dd>{lovvalg.term}</dd>
            <dt>Grunnlagstype:</dt>
            <dd>{grunnlagstype.term}</dd>
            <dt>Land:</dt>
            <dd>{land.term}</dd>
            <dt>Trygdedekning:</dt>
            <dd>{trygdedekning.term}</dd>
            <dt>Kildedokumenttype:</dt>
            <dd>{kildedokumenttype.term}</dd>
            <dt>Register:</dt>
            <dd>{register}</dd>
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
  const { periodeListe } = medlemsskap;

  return (
    <div className="medlemskap panelSeksjon">
      <Nav.EkspanderbartPanel tittel="Medlemskap" apen>
        <section aria-label="Medlemskap">
          <Nav.Container fluid>
            {periodeListe.map(periode => <MedlemskapPeriode key={uuid()} medlemskapPeriode={periode} />)}
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
