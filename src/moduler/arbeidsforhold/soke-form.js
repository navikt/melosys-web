import React, { Component } from 'react';
import PT from 'prop-types';
import { Field, reduxForm } from 'redux-form'

//import { Input } from 'nav-frontend-skjema';
//import Input from './felles-komponenter/skjema/input/input';

import { Hovedknapp } from 'nav-frontend-knapper';
/*
// Field level validations
const required = value => (value ? undefined : 'Required');
const fnr11digits = value => (/^[0-9]{11}$/.test(value) ? undefined: 'Fnr må ha 11 siffer');
*/
const formValidator = (values) => {
  const errors = {};
  if (!values.fnr) {
    errors.fnr = 'Required';
  }
  else if (!/^[0-9]{11}$/.test(values.fnr)) {
    errors.fnr = 'Fnr må ha 11 siffer';
  }
  return errors;
};
const renderFnrField = ({input, name, label, bredde, type, meta: {touched, error}}) => (
  <div>
    <label htmlFor={name} className="skjemaelement__label">{label}</label>
    <div>
      <input {...input} type={type} className={`skjemaelement__input input--${bredde}`}/>
      {touched && ((error && <div className="skjemaelement__feilmelding">{error}</div>))}
    </div>
  </div>
);

class SokeForm extends Component {
  render() {
    const { handleSubmit } = this.props;
    return (
      <div className="search-container">
        <h2 className="typo-undertittel"><span>Søk på person</span></h2>
        <form onSubmit={ handleSubmit }>
          {/*<Input label="Fnr. eller dnr. " bredde="xl" value={this.state.fnr} onChange={handleChange}/>*/}
          <div className="skjemaelement">
            {/*<Field name="fnr" type="text" component={renderFnrField} label="Fnr. eller dnr." validate={[required,fnr11digits]} bredde="xl"/>*/}
            <Field name="fnr" type="text" component={renderFnrField} label="Fnr. eller dnr." bredde="xl"/>
          </div>
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


SokeForm = reduxForm({
  form:'sokeform',
  validate:formValidator
})(SokeForm);

export default SokeForm;
