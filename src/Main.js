import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import Arbeidsforhold from './Arbeidsforhold';

class Main extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path="/arbeidsforhold/:fnr"  component={Arbeidsforhold}/>
        </Switch>
      </div>
    );
  }

}
export default Main;