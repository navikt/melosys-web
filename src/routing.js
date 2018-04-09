import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import Sok from './sider/forside';
import Saksbehandling from './sider/saksbehandling';
import Journalforing from './sider/journalforing';
import Spark from './sider/spark';

const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={Sok} />
    <Route exact path="/spark" component={Spark} />
    <Route path="/saksbehandling/:snr" component={Saksbehandling} />
    <Route path="/journalforing/:snr" component={Journalforing} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
