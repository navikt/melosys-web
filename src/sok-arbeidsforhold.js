import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PT from 'prop-types';

import './sok-arbeidsforhold.css';
import SokeForm from './moduler/arbeidsforhold/soke-form';

class SokArbeidsforhold extends Component {
  submit = values => {
    this.props.history.push(`/arbeidsforhold/${values.fnr}`);
  };
  render() {
    return (
      <div className="arbeidsforholdContainer">
        <SokeForm onSubmit={this.submit} />
      </div>
    );
  }
}

SokArbeidsforhold.propTypes = {
  history: PT.any.isRequired,
};

export default withRouter(SokArbeidsforhold);
