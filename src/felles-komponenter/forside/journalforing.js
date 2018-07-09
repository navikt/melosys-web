import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import { oppgaverOperations } from '../../ducks/oppgaver';
import * as Skjema from '../skjema';

class Journalforing extends Component {
  submitOgVideresend = form => {
    this.props.handleSubmit(form).then(redirectURL => this.props.history.push(redirectURL));
  };
  render() {
    return (
      <Nav.Panel className="forside__sidepanel">
        <Nav.Systemtittel>Journalføring</Nav.Systemtittel>
        <p>Velg type, og klikk &quot;journalfør sak&quot; for å starte en journalføringsoppgave.</p>
        <form onSubmit={this.submitOgVideresend}>

          <Skjema.RadioGruppe feltNavn="Behandlingstype" label="Velg journalføringstype">
            <div className="skjema__horisontalefelter">
              <Skjema.Radio feltNavn="journalforingstype" label="Medlemsskap" value="MDL" forhandsvalgt />
              <Skjema.Radio feltNavn="journalforingstype" label="Unntak" value="UFM" />
            </div>
          </Skjema.RadioGruppe>
          <Nav.Knapp>Journalfør sak</Nav.Knapp>
        </form>
      </Nav.Panel>
    );
  }
}

Journalforing.propTypes = {
  handleSubmit: PT.func.isRequired,
  history: PT.object.isRequired,
};
const jfrTypePicker = ({ journalforingstype }) => {
  const jfrTyperMedlemsskap = {
    SKND: '',
    KLG: '',
    REV: '',
    ML_U: '',
    PS_U: '',
  };
  const jfrTyperUnntak = {
    UFM: '',
  };
  const jfrtyper = (journalforingstype === 'UFM') ? jfrTyperUnntak : jfrTyperMedlemsskap;
  return oppgaverOperations.send('JFR', jfrtyper);
};

export default reduxForm({
  form: 'journalforingsform',
  onSubmit: journalforingstype => jfrTypePicker(journalforingstype),
})(withRouter((Journalforing)));
