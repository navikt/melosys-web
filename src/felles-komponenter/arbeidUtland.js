import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import Landvelger from './skjema/landvelger';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { BOOLSK } from '../constants';

import './arbeidUtland.css';

const ArbeidUtlandEnkelt = ({ indeks, slettArbeidHandler }) => (
  <div className="arbeidUtland__enkelt">
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Fysisk arbeidssted">
          <Skjema.Input label="Gateadresse" feltNavn={`arbeidUtland[${indeks}].adresse.gatenavn`} />
          <Skjema.Input label="Husnummer" feltNavn={`arbeidUtland[${indeks}].adresse.husnummer`} />
          <Skjema.Input label="Postnummer" feltNavn={`arbeidUtland[${indeks}].adresse.postnummer`} />
          <Skjema.Input label="Region" feltNavn={`arbeidUtland[${indeks}].adresse.region`} />
          <Skjema.Input label="Poststed" feltNavn={`arbeidUtland[${indeks}].adresse.poststed`} />
          <Landvelger label="Land" feltNavn={`arbeidUtland[${indeks}].adresse.landKode`} />
        </Nav.Fieldset>
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.RadioGruppe label="Oppgir søker hjemmekontor?" feltNavn={`arbeidUtland[${indeks}].arbeidUtlandHjemmekontor`}>
          <Skjema.Radio feltNavn={`arbeidUtland[${indeks}].arbeidUtlandHjemmekontor`} value={BOOLSK.SANN} label="Ja" />
          <Skjema.Radio feltNavn={`arbeidUtland[${indeks}].arbeidUtlandHjemmekontor`} value={BOOLSK.USANN} label="Nei" />
        </Skjema.RadioGruppe>
        <Skjema.RadioGruppe label="Erstatter vedkommende en tidligere utsendt?" feltNavn={`arbeidUtland[${indeks}].arbeidUtlandErstatning`}>
          <Skjema.Radio feltNavn={`arbeidUtland[${indeks}].arbeidUtlandErstatning`} value={BOOLSK.SANN} label="Ja" />
          <Skjema.Radio feltNavn={`arbeidUtland[${indeks}].arbeidUtlandErstatning`} value={BOOLSK.USANN} label="Nei" />
        </Skjema.RadioGruppe>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Arbeidsandel i prosent">
          <Skjema.Input bredde="XS" type="number" min={0} max={100} feltNavn={`arbeidUtland[${indeks}].arbeidsandelUtland`} label="Arbeidsandel utland, oppgitt i søknad" />
          <Skjema.Input bredde="XS" type="number" min={0} max={100} feltNavn={`arbeidUtland[${indeks}].arbeidsandelNorge`} label="Arbeidsandel Norge, oppgitt i søknad" />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
    <Nav.Knapp mini onClick={() => slettArbeidHandler(indeks)}>- Fjern dette arbeidsstedet</Nav.Knapp>
  </div>
);

ArbeidUtlandEnkelt.propTypes = {
  indeks: PT.number.isRequired,
  slettArbeidHandler: PT.func.isRequired,
};

class ArbeidUtlandWrapper extends Component {
  leggTilArbeidHandler = () => {
    this.props.fields.push({});
  };

  slettArbeidHandler = indeks => {
    this.props.fields.remove(indeks);
  };

  render() {
    const { slettArbeidHandler, leggTilArbeidHandler } = this;
    const panelIkon = Ikoner.Ferdig;

    return (
      <div className="arbeidUtland panelSeksjon">
        <Nav.EkspanderbartpanelBase
          heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om fysisk arbeidssted i utlandet" undertittel="" />}
          ariaTittel="Panel for arbeidssted i utlandet">
          <Nav.Container fluid>
            {this.props.fields.map((fieldName, indeks) => <ArbeidUtlandEnkelt key={fieldName} indeks={indeks} slettArbeidHandler={slettArbeidHandler} />)}
            <Nav.Knapp className="arbeidUtland__leggtil" onClick={leggTilArbeidHandler}>+ Legg til flere arbeidssteder i utlandet</Nav.Knapp>
          </Nav.Container>
        </Nav.EkspanderbartpanelBase>
      </div>
    );
  }
}

ArbeidUtlandWrapper.propTypes = {
  fields: PT.object.isRequired,
};

const ArbeidUtland = props => (<FieldArray name="arbeidUtland" component={ArbeidUtlandWrapper} props={props} />);


export default ArbeidUtland;
