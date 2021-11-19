import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";

import * as Nav from "../../navFrontend";

interface Params {
  behandlingID: string;
}

interface BrevmenyProps extends RouteComponentProps<Params> {}

const Brevmeny = ({ match }: BrevmenyProps) => {
  const { behandlingID } = match.params;

  return <Nav.Container fluid>{behandlingID}</Nav.Container>;
};

export default withRouter(Brevmeny);
