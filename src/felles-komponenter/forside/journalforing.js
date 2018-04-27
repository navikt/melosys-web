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
        <form onSubmit={this.submitOgVideresend}>
          <Nav.Knapp>Journalføring</Nav.Knapp>
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
  onSubmit: () => oppgaverOperations.oppgavePlukker('JFR', ['SKND', 'UFM', 'KLG', 'REV', 'ML_U', 'PS_U']),
})(withRouter((Journalforing)));
