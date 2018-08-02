import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import { oppgaverOperations } from '../../ducks/oppgaver';
import * as Skjema from '../skjema';

class Journalforing extends Component {
  submitOgVideresend = values => {
    const { sendSkjema } = this.props;
    sendSkjema(values.fagomrade).then(redirectURL => this.props.history.push(redirectURL));
  };
  overrideDefaultSubmit = event => {
    event.preventDefault();
  };
  render() {
    return (
      <Nav.Panel className="forside__sidepanel">
        <Nav.Systemtittel>Journalføring</Nav.Systemtittel>
        <p>Velg type, og klikk &quot;journalfør sak&quot; for å starte en journalføringsoppgave.</p>

        <form onSubmit={this.overrideDefaultSubmit}>
          <Skjema.RadioGruppe feltNavn="Behandlingstype" label="Velg journalføringstype">
            <div className="skjema__horisontalefelter">
              <Skjema.Radio feltNavn="fagomrade" label="Medlemsskap" value="MED" />
              <Skjema.Radio feltNavn="fagomrade" label="Unntak" value="UFM" />
            </div>
          </Skjema.RadioGruppe>
          <Nav.Knapp onClick={this.props.handleSubmit(this.submitOgVideresend)}>Journalfør sak</Nav.Knapp>
        </form>
      </Nav.Panel>
    );
  }
}

Journalforing.propTypes = {
  handleSubmit: PT.func.isRequired,
  sendSkjema: PT.func.isRequired,
  history: PT.object.isRequired,
};

const mapStateToProps = _state => ({
  initialValues: {
    fagomrade: 'MED',
  },
});
const mapDispatchToProps = _dispatch => ({
  sendSkjema: fagomrade => oppgaverOperations.sendJournalOppgave(fagomrade),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'journalforingsform',
  onSubmit: () => {},
})(withRouter((Journalforing))));
