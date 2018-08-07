import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import LandVelger from './skjema/landvelger';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidsgiverUtland.css';

const uuid = require('uuid/v4');

const EnkeltForetak = props => {
  const panelIkon = Ikoner.Ferdig;
  const { indeks } = props;

  return (
    <div className="foretakUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Foretak i utlandet" undertittel="" />}
        ariaTittel="Panel for foretak i utlandet">
        <Nav.Container fluid>
          <Nav.Column xs="6">
            <Nav.Fieldset legend="Om foretaket">
              <Skjema.Input label="Firmanavn" feltNavn={`foretakUtland[${indeks}].navn`} />
              <Skjema.Input label="Orgnr / ID nr" feltNavn={`foretakUtland[${indeks}].orgnr`} />
            </Nav.Fieldset>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Fieldset legend="Foretakets adresse">
              <Skjema.Input label="Gatenavn" feltNavn={`foretakUtland[${indeks}].postadresse.gatenavn`} />
              <Skjema.Input label="Postnummer" feltNavn={`foretakUtland[${indeks}].postadresse.postnummer`} />
              <Skjema.Input label="Poststed" feltNavn={`foretakUtland[${indeks}].postadresse.poststed`} />
              <LandVelger label="Land" feltNavn={`foretakUtland[${indeks}].postadresse.land`} />
            </Nav.Fieldset>
          </Nav.Column>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

EnkeltForetak.propTypes = {
  indeks: PT.number.isRequired,
};

class ForetakUtlandWrapper extends Component {
  render() {
    const { fields } = this.props;

    return (
      <div>
        { fields.map((field, indeks) => <EnkeltForetak key={uuid()} indeks={indeks} />)}
      </div>
    );
  }
}

ForetakUtlandWrapper.propTypes = {
  fields: PT.object.isRequired,
};

const ForetakUtland = props => (
  <FieldArray
    name="foretakUtland"
    component={ForetakUtlandWrapper}
    props={props}
  />
);

ForetakUtland.propTypes = {
  organisasjoner: MPT.Organisasjoner,
};

ForetakUtland.defaultProps = {
  organisasjoner: [],
};

export default ForetakUtland;
