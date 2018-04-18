import React from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import * as Nav from '../../utils/navFrontend';
import { oppgaverOperations } from '../../ducks/oppgaver';

import './journalforing.css';

const Journalforing = props => {
  const { handleSubmit } = props;
  return (
    <Nav.Panel className="forside__sidepanel sidepanel__journalforing">
      <Nav.Systemtittel>Journalfør sak</Nav.Systemtittel>
      <form className="journalforing__skjema" onSubmit={handleSubmit}>
        <p>Klikk &quot;journalfør sak&quot; for å starte en journalføringsoppgave.</p>
        <Nav.Knapp className="journalforing__knapp">Journalfør sak</Nav.Knapp>
      </form>
    </Nav.Panel>
  );
};
Journalforing.propTypes = {
  handleSubmit: PT.func.isRequired,
};

export default reduxForm({
  form: 'journalforingsform',
  onSubmit: () => oppgaverOperations.oppgavePlukker('JFR', ['SKND', 'UFM', 'KLG', 'REV', 'ML_U', 'PS_U']),
})(Journalforing);
