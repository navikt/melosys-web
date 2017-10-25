import React from 'react';
import * as Nav from '../utils/navFrontend';

import * as MPT from '../proptypes';
import './medlemskap.css';
import DatoOmrade from './datoOmrade/datoOmrade';

const uuid = require('uuid/v4');

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
          <DatoOmrade periode={periode} titler={{ fom: 'Fra', tom: 'Til' }} />
          <Nav.Row>
            <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Registrert</Nav.Element>{dato.registrert}</Nav.Column>
            <Nav.Column xs="6" className="blokk-xs"><Nav.Element>Besluttet</Nav.Element>{dato.besluttet}</Nav.Column>
          </Nav.Row>
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
            <dd>MEDL</dd>
            <dt>Hentet fra:</dt>
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
      <Nav.EkspanderbartPanel tittel="Medlemskap">
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
