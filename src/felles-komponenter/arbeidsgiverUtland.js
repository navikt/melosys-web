import React from 'react';
import { validForm, rules } from 'react-redux-form-validation';

import * as Nav from '../utils/navFrontend';
import * as MPT from '../proptypes/';
import * as Ikoner from '../resources/images';

import Input from './skjema/input/input';
import Textarea from './skjema/textarea/textarea';

import PanelHeader from '../felles-komponenter/panelHeader/panelHeader';

import './arbeidsgiverUtland.css';

function ArbeidsgiverUtland () {
  return (
    <div className="organisasjonerNorge panelSeksjon">
      <Nav.EkspanderbartpanelBase
        heading={<PanelHeader ikon={Ikoner.Varsel} tittel="Arbeidsgiver i utlandet" undertittel="" />}
        ariaTittel="Panel for arbeidsgiver i utlandet" >
        <Nav.Container fluid>
          <Input bredde="m" label="Navn" feltNavn="navn" />
          <Input bredde="m" label="Organisasjonsnr" feltNavn="organisasjonsnr" />
          <Textarea bredde="m" label="Adresse" feltNavn="adresse" maxLength={100} />

        </Nav.Container>
      </Nav.EkspanderbartpanelBase>
    </div>
  );
}

ArbeidsgiverUtland.propTypes = {
  organisasjoner: MPT.Organisasjoner,
};

ArbeidsgiverUtland.defaultProps = {
  organisasjoner: [],
};

export default validForm({
  form: 'soknaden',
  validate: {
    navn: [rules.required],
    organisasjonsnr: [rules.required],
    adresse: [rules.required],
  },
})(ArbeidsgiverUtland);
