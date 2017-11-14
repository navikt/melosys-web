import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import Sok from './sider/sok';
import Saksbehandling from './sider/saksbehandling';

const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={Sok} />
    <Route path="/saksbehandling/:fnr" component={Saksbehandling} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
