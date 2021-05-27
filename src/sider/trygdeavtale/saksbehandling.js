import React from "react";

import * as Nav from "../../utils/navFrontend";

import Stegvelger from "./stegvelger";
import "./saksbehandling.css";

const Saksbehandling = () => {
  return (
    <div className="saksbehandling">
      <Nav.Container fluid>
        <Nav.Row>
          <Nav.Column xs="7">
            <Stegvelger />
          </Nav.Column>
        </Nav.Row>
      </Nav.Container>
    </div>
  );
};

export default Saksbehandling;
