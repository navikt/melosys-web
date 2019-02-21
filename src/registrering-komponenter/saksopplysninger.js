import React, { Component } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { reduxForm } from 'redux-form';
import * as MKV from 'melosys-kodeverk';
import Personopplysninger from '../soknad-komponenter/personopplysninger';
import {fagsakOperations, fagsakSelectors} from '../ducks/fagsaker';
import * as MPT from "../proptypes";
import Medlemskap from "../soknad-komponenter/medlemskap";

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
  medlemskap: MPT.Medlemskap,
  skjema: PT.any,
};

Saksopplysninger.defaultProps = {
  medlemskap: {},
  skjema: {},
};

const mapStateToProps = state => ({
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
