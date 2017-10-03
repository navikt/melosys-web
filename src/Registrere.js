import React, { Component } from 'react';
import ArbeidsgiverForm from './moduler/arbeidsgiver/arbeidsgiver-form';

class Registrere extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mymessage: '',
    };
  }

  onComplete = data => {
    this.setState({
      mymessage: data,
    });

    // eslint-disable-next-line
    console.log('onComplete', JSON.stringify(data));
  }

  submit = values => {
    // eslint-disable-next-line
    console.log(JSON.stringify(values));
  };

  render () {
    return <ArbeidsgiverForm onComplete={this.onComplete} />;
  }
}

export default Registrere;
