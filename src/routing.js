import React from 'react';
import PT from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import UkjentSide from './sider/ukjentSide';

import Forside from './sider/forside';
import Sok from './sider/sok';
import Saksbehandling from './sider/saksbehandling';
import Journalforing from './sider/journalforing';


const Routing = ({ location }) => (
  <Switch location={location}>
    <Route exact path="/" component={Forside} />
    <Route exact path="/sok/:fnr" component={Sok} />
    <Route path="/saksbehandling/:snr" component={Saksbehandling} />
    <Route path="/journalforing/:journalpostID/:oppgaveID" component={Journalforing} />
    <Route component={UkjentSide} />
  </Switch>
);

Routing.propTypes = {
  location: PT.object.isRequired,
};

export default withRouter(Routing);
