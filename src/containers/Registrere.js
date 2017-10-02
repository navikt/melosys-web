import React, { Component } from 'react';
import ArbeidsgiverForm from '../moduler/arbeidsgiver/arbeidsgiver-form';
class Registrere extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mymessage: ''
    };
  }
  submit = (values) => {
    console.log(JSON.stringify(values));
  };
  onComplete = (data) => {
    this.setState({
      mymessage:data
    });
    console.log('onComplete',JSON.stringify(data));
  };
  render() {
    return (
      <ArbeidsgiverForm onComplete={this.onComplete}/>
    );
  }
}
export default Registrere