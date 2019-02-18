import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import UkjentSide from './sider/ukjentSide';

import Forside from './sider/forside';
import Sok from './sider/sok';
import Saksbehandling from './sider/saksbehandling';
import Journalforing from './sider/journalforing';
import Spark from './sider/spark';
import Kodeverk from './sider/kodeverk';


const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={Forside} />
    <Route exact path="/sok/:fnr" component={Sok} />
    <Route exact path="/spark" component={Spark} />
    <Route exact path="/kodeverk" component={Kodeverk} />
    <Route path="/saksbehandling/:snr" component={Saksbehandling} />
    <Route path="/journalforing/:journalpostID/:oppgaveID" component={Journalforing} />
    <Route component={UkjentSide} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
