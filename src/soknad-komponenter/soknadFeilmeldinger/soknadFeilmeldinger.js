import React, { Fragment } from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { formSelectors } from '../../ducks/form';

import * as Nav from '../../utils/navFrontend';


const Feilmelding = props => (
  <Nav.AlertStripe type="advarsel" >{props.feilmelding}</Nav.AlertStripe>
);

Feilmelding.propTypes = {
  feilmelding: PT.string.isRequired,
};

const SoknadFeilmeldinger = ({
  valideringErrors,
}) => (
  <Fragment>
    {Object.keys(valideringErrors).map(error => <Feilmelding key={valideringErrors[error]} feilmelding={valideringErrors[error]} />)}
  </Fragment>
);

SoknadFeilmeldinger.propTypes = {
  valideringErrors: PT.object,
};

SoknadFeilmeldinger.defaultProps = {
  valideringErrors: {},
};

const mapStateToProps = state => ({
  valideringErrors: formSelectors.SoknadErrorsSelector(state),
});

export default connect(mapStateToProps)(SoknadFeilmeldinger);
