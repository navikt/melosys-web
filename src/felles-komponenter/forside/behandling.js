import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';

import { oppgaverOperations } from '../../ducks/oppgaver/';

import './behandling.css';

class Behandling extends Component {
  submitOgVideresend = form => {
    this.props.handleSubmit(form).then(redirectURL => {
      if (!redirectURL) { return alert('Ingen oppgaver finnes. Videre funksjonalitet ikke implementert.'); }
      this.props.history.push(redirectURL);
      return true;
    });
  }

  render() {
    return (
      <Nav.Panel className="forside__sidepanel sidepanel__behandling">
        <Nav.Systemtittel>Behandle sak</Nav.Systemtittel>
        <p>Du kan oppgi sakstype og behandlingstype for å få tildelt en sak som du ønsker å behandle.</p>
        <form className="behandling__skjema" onSubmit={this.submitOgVideresend}>
          <Nav.Row>
            <Nav.Column xs="4">
              <Nav.Fieldset legend="Sakstype">
                <Skjema.Checkbox label="EU/EØS" feltNavn="EU_EOS" />
                <Skjema.Checkbox label="Trygdeavtale" feltNavn="TRG_AVT" />
                <Skjema.Checkbox label="Folketrygd" feltNavn="FLK_TRG" />
              </Nav.Fieldset>
            </Nav.Column>
            <Nav.Column xs="8">
              <Nav.Fieldset legend="Behandlingstype">
                <Skjema.Checkbox label="Søknad" feltNavn="SKND" />
                <Skjema.Checkbox label="Unntak medlemskap" feltNavn="UFM" />
                <Skjema.Checkbox label="Klage" feltNavn="KLG" />
                <Skjema.Checkbox label="Revurdering" feltNavn="REV" />
                <Skjema.Checkbox label="Melding fra utenlandsk myndighet" feltNavn="ML_U" />
                <Skjema.Checkbox label="Påstand fra utenlandsk myndighet" feltNavn="PS_U" />
              </Nav.Fieldset>
            </Nav.Column>
          </Nav.Row>


          <Nav.Knapp className="behandling__knapp">Behandle sak</Nav.Knapp>
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
  onSubmit: checkboxliste => oppgaverOperations.send('BEH_SAK', checkboxliste),
})(withRouter((Behandling)));
