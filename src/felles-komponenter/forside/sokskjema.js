import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, change } from 'redux-form';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as NyeSaker from '../../ducks/nyesaker';

class SokSkjema extends Component {
  state = { sokFelt: '' }

  submitHandler = form => {
    this.props.lagreSokString(this.state.sokFelt);
    this.props.handleSubmit(form);
  };

  oppdaterLokalSokeState = event => {
    this.setState({ sokFelt: event.target.value });
  }

  render () {
    return (
      <Nav.Panel>
        <Nav.Systemtittel>Søke etter sak</Nav.Systemtittel>
        <form onSubmit={this.submitHandler}>
          <Nav.Input
            label="Søk etter fødselsnummer:"
            bredde="XL"
            onChange={this.oppdaterLokalSokeState}
          />
          <Nav.Knapp>Søk</Nav.Knapp>
        </form>
      </Nav.Panel>
    );
  }
}

SokSkjema.propTypes = {
  handleSubmit: PT.func.isRequired,
  lagreSokString: PT.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  lagreSokString: verdi => dispatch(change('sokEtterSak', 'sokFelt', verdi)),
});

export default connect(null, mapDispatchToProps)(reduxForm({
  form: 'sokEtterSak',
  initialValues: { sokFelt: '' },
  onSubmit: (form, dispatch) => dispatch(NyeSaker.hentNyesaker(form.sokFelt)),
})(SokSkjema));
