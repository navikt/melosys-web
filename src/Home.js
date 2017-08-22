import React, { Component } from 'react';
import SokArbeidsforhold from "./sok-arbeidsforhold";

class Home extends Component {
  render() {
    return (
      <HomeContainer>
        <SokArbeidsforhold/>
      </HomeContainer>
    );
  }

}
const HomeContainer = (props) => (
  <div {...props}/>)
export default Home;