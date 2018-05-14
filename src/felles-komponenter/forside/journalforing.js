import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import { oppgaverOperations } from '../../ducks/oppgaver';

class Journalforing extends Component {
  submitOgVideresend = form => {
    this.props.handleSubmit(form).then(redirectURL => this.props.history.push(redirectURL));
  };
  render() {
    return (
      <Nav.Panel className="forside__sidepanel">
        <Nav.Systemtittel>Journalføring</Nav.Systemtittel>
        <p>Klikk &quot;journalfør sak&quot; for å starte en journalføringsoppgave.</p>
        <form onSubmit={this.submitOgVideresend}>
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

export default reduxForm({
  form: 'journalforingsform',
  onSubmit: () => oppgaverOperations.send('JFR', ['SKND', 'UFM', 'KLG', 'REV', 'ML_U', 'PS_U']),
})(withRouter((Journalforing)));
