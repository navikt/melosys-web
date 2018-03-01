import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import DatoOmrade from '../felles-komponenter/datoOmrade/datoOmrade';

import { tekstEllerDash } from '../utils/utils';

import './medlemskap.css';

const uuid = require('uuid/v4');

/** MedlemskapsSeksjon inneholdet ett enkelt medlemskap. Hver søker kan ha
 * flere medlemskap. Se Confluence for definisjon av "medlemskap".
 *
 * @constructor
 */
function MedlemskapPeriode({ medlemskapPeriode }) {
  const {
    periode = {},
    type = {},
    status = {},
    grunnlagstype = {},
    land = {},
    lovvalg = {},
    trygdedekning,
    kildedokumenttype,
    kilde,
  } = medlemskapPeriode;

  return (
    <div className="medlemskap__enkelt" aria-label="Enkelt medlemskap">
      <Nav.Row>
        {/* START DETALJER */}
        <Nav.Column xs="4">
          <DatoOmrade periode={periode} />
        </Nav.Column>
        <Nav.Column xs="8">
          <dl className="medlemskap__detaljer">
            <dt>Periodetype:</dt>
            <dd>{tekstEllerDash(type.term)}</dd>
            <dt>Status:</dt>
            <dd>{tekstEllerDash(status.term)}</dd>
            <dt>Grunnlagstype:</dt>
            <dd>{tekstEllerDash(grunnlagstype.term)}</dd>
            <dt>Land:</dt>
            <dd>{tekstEllerDash(land.term)}</dd>
            <dt>Lovvalg:</dt>
            <dd>{tekstEllerDash(lovvalg.term)}</dd>
            <dt>Trygdedekning:</dt>
            <dd>{tekstEllerDash(trygdedekning)}</dd>
            <dt>Kildedokumenttype:</dt>
            <dd>{tekstEllerDash(kildedokumenttype)}</dd>
            <dt>Kilde:</dt>
            <dd>{tekstEllerDash(kilde)}</dd>
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
  const { medlemsperiode = [] } = medlemskap;

  return (
    <div className="medlemskap panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Medlemskap} tittel="Medlemskap" undertittel="" />}
        ariaTittel="Panel for medlemskap" >
        <section aria-label="Panel for medlemskap">
          <Nav.Container fluid>
            { medlemsperiode.map(periode => <MedlemskapPeriode key={uuid()} medlemskapPeriode={periode} />) }
          </Nav.Container>
        </section>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Medlemskap.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
};

export default Medlemskap;
