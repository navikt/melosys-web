import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
//import { Route } from 'react-router-dom'
//import PropTypes from 'prop-types'


import { Input } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import './sok-arbeidsforhold.css';

class SokArbeidsforhold extends Component {

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
      console.log('this.props', this.props);
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
}
const ArbeidsforholdContainer = (props) => (
  <div className="arbeidsforholdContainer" {...props}/>
)
export default withRouter(SokArbeidsforhold);
// export default SokArbeidsforhold;
