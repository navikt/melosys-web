import React from 'react';
import PT from 'prop-types';
import { reduxForm } from 'redux-form';
import * as Nav from '../../utils/navFrontend';
import { oppgaverOperations } from '../../ducks/oppgaver';

const Journalforing = props => {
  const { handleSubmit } = props;
  return (
    <Nav.Panel className="forside__sidepanel">
      <Nav.Systemtittel>Journalføring</Nav.Systemtittel>
      <form onSubmit={handleSubmit}>
        <Nav.Knapp>Journalføring</Nav.Knapp>
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
