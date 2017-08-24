import React, { Component } from 'react';

class ArbeidsforholdDetalj extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      arbeidsforhold: {}
    }
  }
  componentDidMount() {
    let API_MELOSYS_URL = 'http://localhost:3002/api/';
    let {fnr, orgnr} = this.props.match.params
    const URI = `${API_MELOSYS_URL}arbeidsforhold/${fnr}/${orgnr}`;
    fetch(URI)
      .then(response => response.json())
      .then(result => this.setState({
        arbeidsforhold: result,
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
        <p>fnr:{this.props.match && this.props.match.params.fnr}</p>
        <p>orgnr:{this.props.match && this.props.match.params.orgnr}</p>
        <p>{JSON.stringify(this.state.arbeidsforhold)}</p>
      </div>
    )
  }
}

export default ArbeidsforholdDetalj;