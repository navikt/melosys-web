import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, change } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';
import * as NyeSaker from '../../ducks/nyesaker';

class SokSkjema extends Component {
  componentWillMount() {
    const { fnr } = this.props.match.params;
    this.oppdaterLokalSokState(fnr);
  }

  vedSokSubmit = form => {
    const { lagreSokString, handleSubmit, history } = this.props;
    const { sokStreng } = this.state;

    lagreSokString(sokStreng);
    handleSubmit(form);
    history.push(`/sok/${sokStreng}`);
  };

  vedEndretSokFelt = event => {
    this.setState({ sokStreng: event.target.value });
  }

  oppdaterLokalSokState = sokStreng => {
    this.setState({ sokStreng });
  }

  render () {
    return (
      <Nav.Panel>
        <Nav.Systemtittel>Søke etter sak</Nav.Systemtittel>
        <form onSubmit={this.vedSokSubmit}>
          <Nav.Input
            label="Søk etter fødselsnummer:"
            bredde="XL"
            onChange={this.vedEndretSokFelt}
            ref={this.state.sokStreng}
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
  history: PT.object.isRequired,
  match: PT.object.isRequired,
};

const mapDispatchToProps = dispatch => ({
  lagreSokString: verdi => dispatch(change('sokEtterSak', 'sokStreng', verdi)),
});

export default withRouter(connect(null, mapDispatchToProps)(reduxForm({
  form: 'sokEtterSak',
  initialValues: { sokFelt: '' },
  onSubmit: (form, dispatch) => dispatch(NyeSaker.hentNyesaker(form.sokStreng)),
})(SokSkjema)));
