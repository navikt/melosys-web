import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
//import { Route } from 'react-router-dom'
//import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'

import { Input } from 'nav-frontend-skjema';
//import Input from './felles-komponenter/skjema/input/input';
import { Hovedknapp } from 'nav-frontend-knapper';
import './sok-arbeidsforhold.css';

let SokeForm = props => {
  const { handleSubmit } = props;
  return (
      <form onSubmit={ handleSubmit }>
        {/*<Input label="Fnr. eller dnr. " bredde="xl" value={this.state.fnr} onChange={handleChange}/>*/}
        <div>
          <label htmlFor="fnr">Fnr. eller dnr. </label>
          <Field name="fnr" component="input" type="text" />
        </div>
        <Hovedknapp>Søk</Hovedknapp>
      </form>
  )
};
SokeForm = reduxForm({
  form:'sokeform'
})(SokeForm);

class SokArbeidsforhold extends Component {
  submit = (values) => {
    this.props.history.push('/arbeidsforhold/'+values.fnr);
  }
  render() {
    return (
      <SokeForm onSubmit={this.submit} />
    );
  }
  /*

  state = {
        fnr: ''
    };
    onChange = (event) => {
        this.setState({ fnr: event.target.value });
    };


    onSubmit = (event) => {
        //console.log('this.refs.fnr', this.state.fnr);
        event.preventDefault();
        this.props.history.push('/arbeidsforhold/'+this.state.fnr);
        // window.location = '/melosys/arbeidsforhold/'+this.state.fnr;
    };

    render() {
      return (
          <ArbeidsforholdContainer>
            <h2 className="typo-undertittel"><span>Søk på person</span></h2>
            <form onSubmit={this.onSubmit}>
                <Input label="Fnr. eller dnr. " bredde="xl" value={this.state.fnr} onChange={this.onChange}/>
                <Hovedknapp>Søk</Hovedknapp>
            </form>
          </ArbeidsforholdContainer>
        );
    }
    */
}
const ArbeidsforholdContainer = (props) => (
  <div className="arbeidsforholdContainer" {...props}/>
)
export default withRouter(SokArbeidsforhold);

