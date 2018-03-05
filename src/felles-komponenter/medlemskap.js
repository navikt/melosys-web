import React, { Component } from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import DatoOmrade from '../felles-komponenter/datoOmrade/datoOmrade';

import { tekstEllerDash } from '../utils/utils';

import './medlemskap.css';

const uuid = require('uuid/v4');

/** MedlemskapEnkeltPeriode inneholdet ett enkelt medlemskap. Hver søker kan ha
 * flere medlemskap. Se Confluence for definisjon av "medlemskap".
 *
 * @constructor
 */
function MedlemskapEnkeltPeriode({ enkeltPeriode }) {
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
  } = enkeltPeriode;

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

MedlemskapEnkeltPeriode.propTypes = {
  enkeltPeriode: MPT.MedlemskapEnkeltPeriode.isRequired,
};

/** En MedlemskapGruppe er en gruppering eller samling av flere medlemskap
 * som har samme status eller type, feks "AVVIST", "PERIODE MED MEDLEMSKAP" eller liknende. Grupperingen
 * gjøres i MedlemskapSelector.
 *
 * Målet med grupperingen er at saksbehandler raskere skal kunne finne frem til relevante perioder
 * hvor søkeren har eller ikke har medlemskap. Dette kan være avgjørende for vurdering av søknaden.
 *
 */
function MedlemskapGruppe(props) {
  const { perioder, overskrift } = props;

  return (
    <div>
      <Nav.Undertittel className="medlemskap__gruppeoverskrift">{overskrift}</Nav.Undertittel>
      <section aria-label="Panel for medlemskap">
        { perioder.map(enkeltPeriode => <MedlemskapEnkeltPeriode key={uuid()} enkeltPeriode={enkeltPeriode} />) }
        { perioder.length === 0 && '(ingen funnet)'}
      </section>
    </div>
  );
}

MedlemskapGruppe.propTypes = {
  perioder: MPT.MedlemskapPerioder.isRequired,
  overskrift: PT.string,
};

MedlemskapGruppe.defaultProps = {
  overskrift: '',
};

/** Dette er hoved-komponenten for Medlemskap som eksponeres ut av modulen og som også
 * settes inn som egen fane med overskriften "Medlemskap" i saksopplysningene.
 *
 */
class Medlemskap extends Component {
  state = { visAvvisteMedlemskap: false }

  toggleAvvisteMedlemskapHandler = e => {
    e.preventDefault();
    this.setState({ visAvvisteMedlemskap: !this.state.visAvvisteMedlemskap });
  }

  render() {
    const { medlemskap } = this.props;
    const { visAvvisteMedlemskap } = this.state;
    const { toggleAvvisteMedlemskapHandler } = this;

    return (
      <div className="medlemskap panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={Ikoner.Medlemskap} tittel="Medlemskap" undertittel="" />}
          ariaTittel="Panel for medlemskap">
          <section aria-label="Panel for medlemskap">
            <Nav.Container fluid>
              <MedlemskapGruppe perioder={medlemskap.perioderMed} overskrift="Perioder med medlemskap" />
              <MedlemskapGruppe perioder={medlemskap.perioderUten} overskrift="Perioder uten medlemskap" />
              <MedlemskapGruppe perioder={medlemskap.perioderUavklart} overskrift="Perioder med uavklart medlemskap" />
              {visAvvisteMedlemskap && <MedlemskapGruppe perioder={medlemskap.perioderAvvist} overskrift="Perioder med avvist medlemskap" /> }
              <Nav.Knapp
                mini
                onClick={toggleAvvisteMedlemskapHandler}
                className="visavvist__knapp">
                {visAvvisteMedlemskap ? 'Skjul avviste medlemskap' : 'Vis avviste medlemskap'}
              </Nav.Knapp>
            </Nav.Container>
          </section>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

Medlemskap.propTypes = {
  medlemskap: MPT.Medlemskap.isRequired,
};

export default Medlemskap;
