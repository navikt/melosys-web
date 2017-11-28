import React from 'react';
import { validForm } from 'react-redux-form-validation';
import PT from 'prop-types';

import * as Validering from './skjema/validering';
import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import Input from './skjema/input/input';
import Textarea from './skjema/textarea/textarea';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidsgiverUtland.css';

function ArbeidsgiverUtland (props) {
  const panelIkon = (props.pristine || props.invalid) ? Ikoner.Varsel : Ikoner.Ferdig;

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Arbeidsgiver i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidsgiver i utlandet">
        <Nav.Container fluid>
          <Nav.Column xs="6">
            <Input label="Firmanavn" feltNavn="foretakUtlandNavn" />
            <Input label="Orgnr / ID nr" feltNavn="foretakUtlandOrgnr" />
          </Nav.Column>
          <Nav.Column xs="6">
            <Textarea bredde="m" label="Adresse" feltNavn="foretakUtlandAdresse" maxLength={100} />
          </Nav.Column>
        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

ArbeidsgiverUtland.propTypes = {
  organisasjoner: MPT.Organisasjoner,
  invalid: PT.bool.isRequired,
  pristine: PT.bool.isRequired,
};

ArbeidsgiverUtland.defaultProps = {
  organisasjoner: [],
};

export default validForm({
  form: 'arbeidsgiverUtlandet',
  validate: {
    navn: [Validering.erPakrevet],
    organisasjonsnr: [Validering.erPakrevet],
    adresse: [Validering.erPakrevet],
  },
})(ArbeidsgiverUtland);
