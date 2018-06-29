import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidsgiverUtland.css';

function OppholdUtland () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opphold i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidssted i utlandet">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Oppholdsperiode">
                <Nav.Column xs="6">
                  <Skjema.Input datoFelt label="Fra og med" feltNavn="oppholdUtlandFom" />
                </Nav.Column>
                <Nav.Column xs="6">
                  <Skjema.Input datoFelt label="Til og med" feltNavn="oppholdUtlandTom" />
                </Nav.Column>
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

OppholdUtland.propTypes = {
  soknadForm: MPT.SoknadForm,
};

OppholdUtland.defaultProps = {
  soknadForm: {},
};

export default OppholdUtland;
