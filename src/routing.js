import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import Forside from './sider/forside';
import Sok from './sider/sok';
import Saksbehandling from './sider/saksbehandling';
import Journalforing from './sider/journalforing';
import Spark from './sider/spark';
import { buildinfo } from './utils/utils';

const NoMatch = ({ location }) => {
  const logdata = {
    message: `Unknown route: ${location.pathname}`,
    buildinfo: buildinfo(),
  };
  window.frontendlogger.error(logdata);
  return (
    <div>
    <h3>No match for <code>{location.pathname}</code></h3>
  </div>
);
};
NoMatch.propTypes = {
  location: PT.object.isRequired,
};
const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={Forside} />
    <Route exact path="/sok/:fnr" component={Sok} />
    <Route exact path="/spark" component={Spark} />
    <Route path="/saksbehandling/:snr" component={Saksbehandling} />
    <Route path="/journalforing/:oppgaveID/:journalpostID" component={Journalforing} />
    <Route component={NoMatch} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
