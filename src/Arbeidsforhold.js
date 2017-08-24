import React, { Component } from 'react';
import ArbeidsforholdTabell from './components/arbeidsforhold-tabell';

class Arbeidsforhold extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      arbeidsforhold: []
    }
  }
  componentDidMount() {
    let API_MELOSYS_URL = 'http://localhost:3002/api/';

    let fnr = this.props.match.params.fnr;
    fetch(API_MELOSYS_URL+'arbeidsforhold/'+fnr)
    .then(response => response.json())
    .then(result => this.setState({
      arbeidsforhold: result.arbeidsforhold,
      loaded: true
    }))
    .catch(error => {
      // eslint-disable-next-line
      console.log(`request failed ${error}`);
    });
  }
  render() {
    return (
      <div>
        <h1>Arbeidsforhold</h1>
        <p>{this.props.match && this.props.match.params.fnr}</p>
        <ArbeidsforholdTabell arbeidsforhold={this.state.arbeidsforhold}/>
      </div>
    );
  }
}

export default Arbeidsforhold;