import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';
import LandVelger from './skjema/landvelger';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './foretakUtland.css';

const EnkeltForetak = ({ indeks, slettForetakHandler }) => (
  <Nav.Row className="foretakUtland__enkelt">
    <Nav.Column xs="6">
      <Nav.Fieldset legend="Om foretaket">
        <Skjema.Input label="Firmanavn" feltNavn={`foretakUtland[${indeks}].navn`} />
        <Skjema.Input label="Orgnr / ID nr" feltNavn={`foretakUtland[${indeks}].orgnr`} />
      </Nav.Fieldset>
    </Nav.Column>
    <Nav.Column xs="6">
      <Nav.Fieldset legend="Foretakets adresse">
        <Skjema.Input label="Gatenavn" feltNavn={`foretakUtland[${indeks}].adresse.gatenavn`} />
        <Skjema.Input label="Husnummer" feltNavn={`foretakUtland[${indeks}].adresse.husnummer`} />
        <Skjema.Input label="Postnummer" feltNavn={`foretakUtland[${indeks}].adresse.postnummer`} />
        <Skjema.Input label="Region" feltNavn={`foretakUtland[${indeks}].adresse.region`} />
        <Skjema.Input label="Poststed" feltNavn={`foretakUtland[${indeks}].adresse.poststed`} />
        <LandVelger label="Land" feltNavn={`foretakUtland[${indeks}].adresse.landKode`} />
      </Nav.Fieldset>
    </Nav.Column>
    <Nav.Knapp mini onClick={() => slettForetakHandler(indeks)}>- Fjern dette foretaket</Nav.Knapp>
  </Nav.Row>
);

EnkeltForetak.propTypes = {
  indeks: PT.number.isRequired,
  slettForetakHandler: PT.func.isRequired,
};

class ForetakUtlandWrapper extends Component {
  leggTilForetakHandler = () => {
    this.props.fields.push({});
  }

  slettForetakHandler = indeks => {
    this.props.fields.remove(indeks);
  }

  render() {
    const panelIkon = Ikoner.Ferdig;
    const { fields } = this.props;
    const { slettForetakHandler } = this;

    return (
      <div className="foretakUtland panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Foretak i utlandet" undertittel="" />}
          ariaTittel="Panel for foretak i utlandet">
          <Nav.Container fluid>
            { fields.map((fieldName, indeks) => (<EnkeltForetak key={fieldName} indeks={indeks} slettForetakHandler={slettForetakHandler} />))}
            <Nav.Knapp className="foretakUtland__leggtil" onClick={this.leggTilForetakHandler}>+ Legg til flere foretak i utlandet</Nav.Knapp>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
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

export default ForetakUtland;
