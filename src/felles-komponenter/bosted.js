import React from 'react';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import Landvelger from './skjema/landvelger';

import './arbeidsgiverUtland.css';

const uuid = require('uuid/v4');

const Bosted = props => {
  const { erValidert, soknadForm } = props;
  const panelIkon = erValidert ? Ikoner.Ferdig : Ikoner.Varsel;
  const { studentIEOS } = soknadForm.values ? soknadForm.values : false;

  return (
    <div className="bosted panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger for vurdering av bosted" undertittel="" />}
        ariaTittel="Panel for opplysninger om bosted, fra søknaden">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="intensjonOmRetur" legend="Har intensjon om å returnere til Norge">
                <Skjema.Radio feltNavn="intensjonOmRetur" value="true" label="Ja" />
                <Skjema.Radio feltNavn="intensjonOmRetur" value="false" label="Nei" />
              </Skjema.RadioGruppe>
              <Skjema.RadioGruppe feltNavn="bostedUtenforNorge" legend="Har bostedsland utenfor Norge">
                <Skjema.Radio feltNavn="bostedUtenforNorge" value="true" label="Ja" />
                <Skjema.Radio feltNavn="bostedUtenforNorge" value="false" label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Fieldset legend="Nærmeste families bosted">
                <Landvelger feltNavn="familiesBosted" />
              </Nav.Fieldset>
              <Nav.Fieldset legend="Opphold i Norge (måneder pr kalenderår)">
                <Skjema.Select feltNavn="antallMaanederINorge" label="Velg antall måneder" bredde="xs">
                  {new Array(12).fill(undefined).map((element, index) => <option value={index + 1} key={uuid()}>{index + 1}</option>)}
                </Skjema.Select>
              </Nav.Fieldset>
              <Nav.Fieldset legend="Pensjonist">
                Informasjon om pensjonist:
              </Nav.Fieldset>
              <Nav.Fieldset legend="Student i EØS-land">
                <Nav.Row>
                  <Nav.Column xs="12">
                    <Skjema.Checkbox label="Søkeren er student i EØS-land" feltNavn="studentIEOS" />
                  </Nav.Column>
                  <Nav.Column xs="6">
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
                </Nav.Row>
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

Bosted.propTypes = {
  soknadForm: MPT.SoknadForm,
  erValidert: PT.bool,
};

Bosted.defaultProps = {
  soknadForm: {},
  erValidert: true,
};

export default Bosted;
