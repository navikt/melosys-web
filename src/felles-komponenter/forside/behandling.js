import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';

import { oppgaverOperations } from '../../ducks/oppgaver/';

class Behandling extends Component {
  submitOgVideresend = form => {
    this.props.handleSubmit(form).then(redirectURL => this.props.history.push(redirectURL));
  }

  render() {
    return (
      <Nav.Panel className="forside__sidepanel">
        <Nav.Systemtittel>Behandle sak</Nav.Systemtittel>
        <form onSubmit={this.submitOgVideresend}>
          <Nav.Fieldset legend="Saksområde (sakstype)">
            <Skjema.Checkbox label="EU/EØS" feltNavn="EU_EOS" />
            <Skjema.Checkbox label="Trygdeavtale" feltNavn="TRG_AVT" />
            <Skjema.Checkbox label="Folketrygd" feltNavn="FLK_TRG" />
          </Nav.Fieldset>
          <Nav.Fieldset legend="Sakstype (behandlingstype)">
            <Skjema.Checkbox label="Søknad" feltNavn="SKND" />
            <Skjema.Checkbox label="Unntak medlemskap" feltNavn="UFM" />
            <Skjema.Checkbox label="Klage" feltNavn="KLG" />
            <Skjema.Checkbox label="Revurdering" feltNavn="REV" />
            <Skjema.Checkbox label="Melding fra utenlandsk myndighet" feltNavn="ML_U" />
            <Skjema.Checkbox label="Påstand fra utenlandsk myndighet" feltNavn="PS_U" />
          </Nav.Fieldset>
          <Nav.Knapp>Hent ny sak til behandling</Nav.Knapp>
        </form>
      </Nav.Panel>
    );
  }
}

Behandling.propTypes = {
  handleSubmit: PT.func.isRequired,
  history: PT.object.isRequired,
};

export default reduxForm({
  form: 'behandlingsform',
  onSubmit: checkboxliste => oppgaverOperations.oppgavePlukker('BEH_SAK', checkboxliste),
})(withRouter((Behandling)));
