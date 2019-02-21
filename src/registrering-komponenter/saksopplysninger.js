import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';

import * as MPT from '../proptypes';
import Personopplysninger from '../soknad-komponenter/personopplysninger';
import Medlemskap from '../soknad-komponenter/medlemskap';

import { fagsakOperations, fagsakSelectors } from '../ducks/fagsaker';

class Saksopplysninger extends Component {
  async componentDidMount() {
    await this.lastInnSaksopplysninger();
  }

  lastInnSaksopplysninger= async () => {
    const { hentFagsaker } = this.props;
    const response = await hentFagsaker(4);
    console.log(response);
  };

  overstyrSubmit = event => {
    event.preventDefault();
  };

  render() {
    const { medlemskap } = this.props;

    return (
      <form name="registrering" id="registrering" onSubmit={this.overstyrSubmit} >
        <Personopplysninger />
        {medlemskap && <Medlemskap medlemskap={medlemskap} />}
      </form>
    );
  }
}

Saksopplysninger.propTypes = {
  hentFagsaker: PT.func.isRequired,
  inntekt: MPT.Inntekt,
  medlemskap: MPT.Medlemskap,
  skjema: PT.any,
};

Saksopplysninger.defaultProps = {
  inntekt: {},
  medlemskap: {},
  skjema: {},
};

const mapStateToProps = state => ({
  inntekt: fagsakSelectors.InntektSoknadenSelector(state),
  medlemskap: fagsakSelectors.MedlemskapSelector(state),
});
const mapDispatchToProps = dispatch => ({
  hentFagsaker: saksnummer => dispatch(fagsakOperations.hent(saksnummer)),
});

const SaksopplysningerForm = reduxForm({
  form: 'registrering',
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(Saksopplysninger);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SaksopplysningerForm));
