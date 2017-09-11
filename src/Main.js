import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import Arbeidsforhold from './Arbeidsforhold';
import ArbeidsforholdDetalj from './ArbeidsforholdDetalj';
import "./Main.css";

class Main extends Component {
  render() {
    return (
      <div className="main-container">
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path="/arbeidsforhold/:fnr" component={Arbeidsforhold}/>
          <Route path="/arbeidsforholdet/:fnr/:orgnr/:arbeidsforholdID" component={ArbeidsforholdDetalj}/>
        </Switch>
      </div>
    );
  }

}
export default Main;