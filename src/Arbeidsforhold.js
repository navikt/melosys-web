import React, { Component } from 'react';

class Arbeidsforhold extends Component {
  render() {
    return (
      <div>
        <h1>Arbeidsforhold</h1>
        <p>{this.props.match && this.props.match.params.fnr}</p>
      </div>
    );
  }
}

export default Arbeidsforhold;