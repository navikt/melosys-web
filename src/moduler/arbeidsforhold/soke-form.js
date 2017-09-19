import React, { Component } from 'react';
import PT from 'prop-types';
import { formValueSelector, isDirty } from 'redux-form'
import { connect } from 'react-redux';
import { validForm, rules } from 'react-redux-form-validation';

import { Hovedknapp } from 'nav-frontend-knapper';
import { formNavn } from './arbeidsforhold-utils';
import Input from '../../felles-komponenter/skjema/input/input';



class SokeForm extends Component {
  render() {
    const { handleSubmit } = this.props;
    return (
      <div className="search-container">
        <h2 className="typo-undertittel"><span>Søk på person</span></h2>
        <form onSubmit={ handleSubmit }>
          <Input
            feltnavn="fnr"
            label="Fnr. eller dnr."
            bredde="xl"
            autoFocus
          />
          <Hovedknapp>Søk</Hovedknapp>
        </form>
      </div>
    );
  }
}

SokeForm.propTypes = {
  fields: PT.object.isRequired,
  handleSubmit: PT.func.isRequired
};

const SokeReduxForm = validForm({
  form:formNavn,
  errorSummaryTitle: 'Fix these errors',
  onSubmit:alert('onSubmit'),
  validate: {
    fnr: [rules.required]
  }
})(SokeForm);

const mapStateToProps = (state, props) => {
  const selector = formValueSelector(formNavn);
  return {
    fnr: selector(state, 'fnr'),
    isDirty: isDirty(formNavn)(state)
  }
};

export default connect(mapStateToProps)(SokeReduxForm);
