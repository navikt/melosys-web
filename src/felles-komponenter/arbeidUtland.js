import React from 'react';
import { FieldArray } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import Landvelger from './skjema/landvelger';
import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import { BOOLSK } from '../constants';

import './arbeidUtland.css';

const uuid = require('uuid/v4');

const ArbeidUtlandEnkelt = ({ index }) => (
  <Nav.Container fluid>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Fysisk arbeidssted">
          <Skjema.Input label="Gateadresse" feltNavn={`arbeidUtland[${index}].adresse.gatenavn`} />
          <Skjema.Input label="Postnummer" feltNavn={`arbeidUtland[${index}].adresse.postnummer`} />
          <Skjema.Input label="Poststed" feltNavn={`arbeidUtland[${index}].adresse.poststed`} />
          <Landvelger label="Land" feltNavn={`arbeidUtland[${index}].adresse.landKoden`} />
        </Nav.Fieldset>
      </Nav.Column>
      <Nav.Column xs="6">
        <Skjema.RadioGruppe label="Oppgir søker hjemmekontor?" feltNavn={`arbeidUtland[${index}].arbeidUtlandHjemmekontor`}>
          <Skjema.Radio feltNavn={`arbeidUtland[${index}].hjemmekontor`} value={BOOLSK.SANN} label="Ja" />
          <Skjema.Radio feltNavn={`arbeidUtland[${index}].hjemmekontor`} value={BOOLSK.USANN} label="Nei" />
        </Skjema.RadioGruppe>
        <Skjema.RadioGruppe label="Erstatter vedkommende en tidligere utsendt?" feltNavn={`arbeidUtland[${index}].arbeidUtlandErstatning`}>
          <Skjema.Radio feltNavn={`arbeidUtland[${index}].arbeidUtlandErstatning`} value={BOOLSK.SANN} label="Ja" />
          <Skjema.Radio feltNavn={`arbeidUtland[${index}].arbeidUtlandErstatning`} value={BOOLSK.USANN} label="Nei" />
        </Skjema.RadioGruppe>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Fieldset legend="Arbeidsandel i prosent">
          <Skjema.Input bredde="XS" type="number" feltNavn={`arbeidUtland[${index}].arbeidsandelUtland`} label="Arbeidsandel utland, oppgitt i søknad" />
          <Skjema.Input bredde="XS" type="number" feltNavn={`arbeidUtland[${index}].arbeidsandelNorge`} label="Arbeidsandel Norge, oppgitt i søknad" />
        </Nav.Fieldset>
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

ArbeidUtlandEnkelt.propTypes = {
  index: PT.number.isRequired,
};

const ArbeidUtland = ({ fields }) => {
  const panelIkon = Ikoner.Ferdig;
  const alleArbeid = fields.getAll() || [];

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Opplysninger om arbeid i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidssted i utlandet">
        {alleArbeid.map((enket, index) => <ArbeidUtlandEnkelt key={uuid()} index={index} />)}
      </Nav.EkspanderbartpanelBase>
    </div>
  );
};

ArbeidUtland.propTypes = {
  fields: PT.object.isRequired,
};

const ArbeidUtlandWrapper = props => (<FieldArray name="arbeidUtland" component={ArbeidUtland} props={props} />);

ArbeidUtlandWrapper.propTypes = {
  organisasjoner: MPT.Organisasjoner,
};

ArbeidUtlandWrapper.defaultProps = {
  organisasjoner: [],
};

export default ArbeidUtlandWrapper;
