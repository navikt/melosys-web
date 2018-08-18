import React from 'react';
import PT from 'prop-types';
import { Link, Route, Switch, withRouter } from 'react-router-dom';

import Forside from './sider/forside';
import Sok from './sider/sok';
import Saksbehandling from './sider/saksbehandling';
import Journalforing from './sider/journalforing';
import Spark from './sider/spark';

const NoMatch = ({ location }) => (
  <div>
    <h3>Ukjent side <code>{location.pathname}</code></h3>
    <Link to="/" alt="NAV, lenke hovedsiden">
      <h3>Tilbake til start</h3>
    </Link>
  </div>
);
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
