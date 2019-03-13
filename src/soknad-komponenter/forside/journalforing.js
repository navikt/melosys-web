import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as KV from '../../kodeverk';
import * as Nav from '../../utils/navFrontend';
import { oppgaverOperations } from '../../ducks/oppgaver';
import * as Skjema from '../skjema';

const Journalforing = props => {
  const submitOgVideresend = async values => {
    const { sendSkjema, history } = props;
    const redirectURL = await sendSkjema(values.fagomrade);
    history.push(redirectURL);
  };
  const overrideDefaultSubmit = event => {
    event.preventDefault();
  };

  return (
    <Nav.Panel className="forside__sidepanel">
      <Nav.Systemtittel>Journalføring</Nav.Systemtittel>
      <p>Velg type, og klikk &quot;journalfør sak&quot; for å starte en journalføringsoppgave.</p>

      <form onSubmit={overrideDefaultSubmit}>
        <Skjema.RadioGruppe feltNavn="Behandlingstype" label="Velg journalføringstype">
          <div className="skjema__horisontalefelter">
            <Skjema.Radio feltNavn="fagomrade" label="Medlemsskap" value="MED" />
            <Skjema.Radio feltNavn="fagomrade" label="Unntak" value="UFM" disabled />
          </div>
        </Skjema.RadioGruppe>
        <Nav.Knapp onClick={props.handleSubmit(submitOgVideresend)}>Journalfør sak</Nav.Knapp>
      </form>
    </Nav.Panel>
  );
};

Journalforing.propTypes = {
  handleSubmit: PT.func.isRequired,
  sendSkjema: PT.func.isRequired,
  history: PT.object.isRequired,
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
