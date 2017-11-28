import React from 'react';
import { validForm } from 'react-redux-form-validation';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';
import * as Skjema from './skjema';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidsgiverUtland.css';

function ArbeidsgiverUtland (props) {
  const panelIkon = (props.pristine || props.invalid) ? Ikoner.Varsel : Ikoner.Ferdig;

  return (
    <div className="arbeidsgiverUtland panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={panelIkon} tittel="Arbeidssted i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidssted i utlandet">
        <Nav.Container fluid>
          <Nav.Column xs="6">
            <Skjema.Input label="Firmanavn" feltNavn="foretakUtlandNavn" />
            <Skjema.Input label="Orgnr / ID nr" feltNavn="foretakUtlandOrgnr" />
          </Nav.Column>
          <Nav.Column xs="6">
            <Skjema.Textarea bredde="m" label="Adresse" feltNavn="foretakUtlandAdresse" maxLength={100} />
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
    foretakUtlandNavn: [Skjema.Validering.erPakrevet],
    foretakUtlandOrgnr: [Skjema.Validering.erPakrevet],
    foretakUtlandAdresse: [Skjema.Validering.erPakrevet],
  },
})(ArbeidsgiverUtland);
