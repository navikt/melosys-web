import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';


import Sok from './containers/sok';
import Saksbehandling from './containers/saksbehandling';

//Todo: Avvikle de 4 komponentene nedenfor
import Home from './containers/Home';
import Arbeidsforhold from './containers/Arbeidsforhold';
import ArbeidsforholdDetalj from './containers/ArbeidsforholdDetalj';
import Registrere from './containers/Registrere';

const Routing = ({ location }) =>
  <Switch location={location}>
    <Route exact path='/' component={Home}/>

    <Route path="/sok/" component={Sok}/>
    <Route path="/saksbehandling/:fnr" component={Saksbehandling}/>
    <Route path="/arbeidsforhold/:fnr" component={Arbeidsforhold}/>
    <Route path="/arbeidsforholdet/:fnr/" component={ArbeidsforholdDetalj}/>
    <Route path="/registrere" component={Registrere}/>
  </Switch>;

Routing.propTypes = {
  location: PT.object.isRequired
};

export default withRouter(Routing);