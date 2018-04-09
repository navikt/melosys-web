import React from 'react';
import { reduxForm } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as Skjema from '../skjema/';
import * as NyeSaker from '../../ducks/nyesaker';

const Sok = props => (
  <Nav.Panel className="forside__sidepanel">
    <Nav.Systemtittel>Søke etter sak</Nav.Systemtittel>
    <form onSubmit={props.handleSubmit}>
      <Skjema.Input
        feltNavn="sokFelt"
        label="Søk etter fødselsnummer:"
        bredde="XL"
      />
      <Nav.Knapp>Søk</Nav.Knapp>
    </form>
  </Nav.Panel>
);

Sok.propTypes = {
  handleSubmit: PT.func.isRequired,
};

export default reduxForm({
  form: 'sokEtterSak',
  onSubmit: (form, dispatch) => dispatch(NyeSaker.hentNyesaker(form.sokFelt)),
})(Sok);
