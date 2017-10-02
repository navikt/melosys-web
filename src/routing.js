import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import Home from './Home';
import Arbeidsforhold from './containers/Arbeidsforhold';
import ArbeidsforholdDetalj from './containers/ArbeidsforholdDetalj';
import Registrere from './Registrere';

const Routing = ({ location }) =>
  <Switch location={location}>
    <Route exact path='/' component={Home}/>
    <Route path="/arbeidsforhold/:fnr" component={Arbeidsforhold}/>
    <Route path="/arbeidsforholdet/:fnr/" component={ArbeidsforholdDetalj}/>
    <Route path="/registrere" component={Registrere}/>
  </Switch>;

Routing.propTypes = {
  location: PT.object.isRequired
};

export default withRouter(Routing);