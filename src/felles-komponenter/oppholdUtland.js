import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidsgiverUtland.css';

function OppholdUtland ({ soknadForm: { values: { studentIEOS } } }) {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opphold i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidssted i utlandet">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Nav.Fieldset legend="Student i EØS-land">
                <Nav.Column xs="12">
                  <Skjema.Checkbox label="Søkeren er student i EØS-land" feltNavn="studentIEOS" />
                </Nav.Column>
                <Nav.Column xs="6">
                  <Skjema.Input label="Skole" feltNavn="studentSkole" disabled={!studentIEOS} />
                  <Skjema.Input label="Semester" feltNavn="studentSemester" disabled={!studentIEOS} />
                </Nav.Column>
                <Nav.Column xs="6">
                  <Skjema.Input label="Studieland" feltNavn="studieLand" disabled={!studentIEOS} />
                  <Skjema.Textarea
                    maxLength={1000}
                    label="Beskrivelse av finansiering"
                    feltNavn="studentFinansiering"
                    disabled={!studentIEOS}
                  />
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
