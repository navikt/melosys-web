import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import Home from './Home';
import Arbeidsforhold from './Arbeidsforhold';
import ArbeidsforholdDetalj from './ArbeidsforholdDetalj';

const Routing = ({ location }) =>
  <Switch location={location}>
    <Route exact path='/' component={Home}/>
    <Route path="/arbeidsforhold/:fnr" component={Arbeidsforhold}/>
    <Route path="/arbeidsforholdet/:fnr/" component={ArbeidsforholdDetalj}/>
  </Switch>;

Routing.propTypes = {
  location: PT.object.isRequired
};

export default withRouter(Routing);