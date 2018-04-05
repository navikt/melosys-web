import React from 'react';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema';

import { oppgaverOperations } from '../../ducks/oppgaver/';

const Behandling = props => {
  const { handleSubmit } = props;

  return (
    <Nav.Panel className="forside__sidepanel">
      <Nav.Systemtittel>Behandle sak</Nav.Systemtittel>
      <form onSubmit={handleSubmit}>
        <Nav.Fieldset legend="Saksområde (sakstype)">
          <Skjema.Checkbox label="EU/EØS" feltNavn="eueos" />
          <Skjema.Checkbox label="Trygdeavtale" feltNavn="trygdeavtale" />
          <Skjema.Checkbox label="Folketrygd" feltNavn="folketrygd" />
        </Nav.Fieldset>
        <Nav.Fieldset legend="Sakstype (behandlingstype)">
          <Skjema.Checkbox label="Søknad" feltNavn="soknad" />
          <Skjema.Checkbox label="Klage" feltNavn="klage" />
          <Skjema.Checkbox label="Revurdering" feltNavn="revurdering" />
          <Skjema.Checkbox label="Melding fra utenlandsk myndighet" feltNavn="meldingFraUtenlandskMyndighet" />
          <Skjema.Checkbox label="Påstand fra utenlandsk myndighet" feltNavn="pastandFraUtenlandskMyndighet" />
        </Nav.Fieldset>
        <Nav.Knapp>Hent ny sak til behandling</Nav.Knapp>
      </form>
    </Nav.Panel>
  );
};

Behandling.propTypes = {
  handleSubmit: PT.func.isRequired,
};

export default reduxForm({
  form: 'behandlingsform',
  onSubmit: (oppgave, dispatch) => dispatch(oppgaverOperations.oppgavePlukker(oppgave)),
})(Behandling);
