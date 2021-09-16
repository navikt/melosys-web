import React, { ReactNode } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Utils from "../../../../../../utils";
import * as Nav from "../../../../../../utils/navFrontend";

interface Kolonne {
  innhold: ReactNode;
  bredde: ColumnWidth;
}

interface AdresseradProps {
  kolonner: Kolonne[];
}

const Adresserad = ({ kolonner }: AdresseradProps) => (
  <Nav.Row>
    {kolonner.map((kolonne) => (
      <Nav.Column key={Utils._uuid()} xs={kolonne.bredde}>
        {kolonne.innhold}
      </Nav.Column>
    ))}
  </Nav.Row>
);

export default Adresserad;
