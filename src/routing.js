import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import Sok from './sider/sok';
import Saksbehandling from './sider/saksbehandling';
import Arbeidsforhold from './sider/Arbeidsforhold';
import ArbeidsforholdDetalj from './sider/ArbeidsforholdDetalj';
import Registrere from './sider/Registrere';

const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={Sok} />
    <Route path="/saksbehandling/:fnr" component={Saksbehandling} />
    <Route path="/arbeidsforhold/:fnr" component={Arbeidsforhold} />
    <Route path="/arbeidsforholdet/:fnr/" component={ArbeidsforholdDetalj} />
    <Route path="/registrere" component={Registrere} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
