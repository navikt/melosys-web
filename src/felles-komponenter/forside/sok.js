import React from 'react';
import { reduxForm } from 'redux-form';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema/';

const Sok = props => {
  return (
    <Nav.Panel className="forside__sidepanel">
      <Nav.Systemtittel>Søke etter sak</Nav.Systemtittel>
      <form onSubmit={props.handleSubmit}>
        <Skjema.Input
          feltNavn="sokFelt"
          label="Fnr. eller dnr."
          bredde="XL"
        />
        <Nav.Knapp>Søk</Nav.Knapp>
      </form>
    </Nav.Panel>
  );
};

export default reduxForm({
  form: 'sokettersak',
  onSubmit: () => console.log('sok'),
})(Sok);
