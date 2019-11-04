import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, change } from 'redux-form';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';

import './sokskjema.css';

class SokSkjema extends Component {
  UNSAFE_componentWillMount() {
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
  };

  oppdaterLokalSokState = sokStreng => {
    this.setState({ sokStreng });
  };

  render () {
    return (
      <Nav.Panel>
        <Nav.Systemtittel>Søke etter person</Nav.Systemtittel>
        <p>Oversikt over alle saker og behandlinger på en person</p>
        <form className="sokeskjema" onSubmit={this.vedSokSubmit}>
          <Nav.Input
            id="sokeskjema_id"
            label=""
            className="sokeskjema__input"
            bredde="XL"
            onChange={this.vedEndretSokFelt}
            ref={this.state.sokStreng}
            placeholder="F.nr./d-nr."
          />
          <Nav.Knapp className="sokeskjema__knapp">Søk</Nav.Knapp>
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
  lagreSokString: verdi => dispatch(change(KV.Form.SOK_ETTER_SAK, 'sokStreng', verdi)),
});

export default withRouter(connect(null, mapDispatchToProps)(reduxForm({
  form: KV.Form.SOK_ETTER_SAK,
  initialValues: { sokFelt: '' },
  onSubmit: () => {},
})(SokSkjema)));
