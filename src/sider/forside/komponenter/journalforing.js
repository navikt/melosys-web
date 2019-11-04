import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';
import { oppgaverOperations } from '../../../ducks/oppgaver';
import * as Skjema from '../../../felleskomponenter/skjema';

class Journalforing extends Component {
  submitOgVideresend = async values => {
    const { sendSkjema, history } = this.props;
    const redirectURL = await sendSkjema(values.fagomrade);
    history.push(redirectURL);
  };
  overrideDefaultSubmit = event => {
    event.preventDefault();
  };
  render() {
    const { redigerbart } = this.props;
    return (
      <Nav.Panel className="forside__sidepanel">
        <Nav.Systemtittel>Journalføring</Nav.Systemtittel>
        <p>Velg saksområde for å starte en journalføringsoppgave.</p>

        <form onSubmit={this.overrideDefaultSubmit}>
          <Skjema.RadioGruppe feltNavn="Behandlingstype">
            <div className="skjema__horisontalefelter">
              <Skjema.Radio feltNavn="fagomrade" label="Medlemskap" value="MED" disabled={!redigerbart} />
              <Skjema.Radio feltNavn="fagomrade" label="Unntak" value="UFM" disabled />
            </div>
          </Skjema.RadioGruppe>
          <Nav.Knapp onClick={this.props.handleSubmit(this.submitOgVideresend)} disabled={!redigerbart}>Journalfør dokument</Nav.Knapp>
        </form>
      </Nav.Panel>
    );
  }
}

Journalforing.propTypes = {
  handleSubmit: PT.func.isRequired,
  sendSkjema: PT.func.isRequired,
  history: PT.object.isRequired,
  redigerbart: PT.bool,
};

Journalforing.defaultProps = {
  redigerbart: false,
};

const mapStateToProps = () => ({
  initialValues: {
    fagomrade: 'MED',
  },
});
const mapDispatchToProps = () => ({
  sendSkjema: fagomrade => oppgaverOperations.sendJournalOppgave(fagomrade),
});

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: KV.Form.FORSIDE_JOURNALFORINGS_FORM,
  onSubmit: () => {},
})(withRouter((Journalforing))));
