import React from 'react';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';
import Landvelger from './skjema/landvelger';

import './arbeidsgiverUtland.css';

const uuid = require('uuid/v4');

function Bosted () {
  const panelIkon = Ikoner.Ferdig;

  return (
    <div className="bosted panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om bosted, fra søknaden" undertittel="" />}
        ariaTittel="Panel for opplysninger om bosted, fra søknaden">
        <Nav.Container fluid>
          <Nav.Row>
            <Nav.Column xs="12">
              <Skjema.RadioGruppe feltNavn="intensjonOmRetur" label="Har intensjon om å returnere til Norge">
                <Skjema.Radio feltNavn="intensjonOmRetur" value="true" label="Ja" />
                <Skjema.Radio feltNavn="intensjonOmRetur" value="false" label="Nei" />
              </Skjema.RadioGruppe>
              <Nav.Fieldset legend="Har bostedsland utenfor Norge">
                <Skjema.Radio feltNavn="bostedUtenforNorge" value="true" label="Ja" />
                <Skjema.Radio feltNavn="bostedUtenforNorge" value="false" label="Nei" />
              </Nav.Fieldset>
              <Nav.Fieldset legend="Nærmeste families bosted">
                <Landvelger feltNavn="familiesBosted" />
              </Nav.Fieldset>
              <Nav.Fieldset legend="Opphold i Norge (måneder pr kalenderår)">
                <Skjema.Select feltNavn="antallMaanederINorge" label="Velg antall måneder" bredde="xs">
                  {new Array(12).fill(undefined).map((element, index) => <option value={index + 1} key={uuid()}>{index + 1}</option>)}
                </Skjema.Select>
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

Bosted.propTypes = {
  soknadForm: MPT.SoknadForm,
};

Bosted.defaultProps = {
  soknadForm: {},
};

export default Bosted;
