import React from 'react';
import PT from 'prop-types';
import * as Nav from '../utils/navFrontend';

import * as MPT from '../proptypes';
import './medlemskap.css';

const uuid = require('uuid/v4');

/** Dato-område med mulighet for Periode og custom Titler,
 *
 * @param props.priode Object Periode i formatet {fom:'',tom:''}
 * @param props.titler Object Tittel i formatet {fom:'',tom:''}
 * Todo 24/10/17: Vurder å løfte denne komponenten ut som en egen fil for gjenburk andre steder om hensiktsmessig.
 */
const DatoOmrade = ({ periode, titler }) => (
  <Nav.Row>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>{titler.fom}</Nav.Element>{periode.fom}</Nav.Column>
    <Nav.Column xs="6" className="blokk-xs"><Nav.Element>{titler.tom}</Nav.Element>{periode.tom}</Nav.Column>
  </Nav.Row>
);

DatoOmrade.propTypes = {
  periode: MPT.Periode.isRequired,
  titler: PT.shape({ fom: PT.string, tom: PT.string }).isRequired,
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

  const registreringsDato = { fom: dato.registrert, tom: dato.besluttet };

  return (
    <div className="medlemskap__enkelt" aria-label="Enkeltmedlemsskap">
      <Nav.Row>
        {/* START DATO RANGE */}
        <Nav.Column xs="6" lg="5">
          <DatoOmrade periode={periode} titler={{ fom: 'Fra', tom: 'Til' }} />
          <DatoOmrade periode={registreringsDato} titler={{ fom: 'Registrert', tom: 'Besluttet' }} />
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
