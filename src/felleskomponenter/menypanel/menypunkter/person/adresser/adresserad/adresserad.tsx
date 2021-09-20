import React, { ReactNode } from "react";
import { ColumnWidth } from "nav-frontend-grid";
import classNames from "classnames";

import * as Utils from "../../../../../../utils";
import * as Nav from "../../../../../../utils/navFrontend";

import "./adresserad.css";

export enum Farge {
  Groenn = "Groenn",
  Roed = "Roed",
}

interface Kolonne {
  innhold: ReactNode;
  bredde: ColumnWidth;
  tekstfarge?: Farge;
}

interface AdresseradProps {
  kolonner: Kolonne[];
}

const Adresserad = ({ kolonner }: AdresseradProps) => (
  <Nav.Row className="adresseliste__rad">
    {kolonner.map((kolonne) => {
      const columnCls = classNames({
        "adresseliste__rad--roed": kolonne.tekstfarge === Farge.Roed,
        "adresseliste__rad--groenn": kolonne.tekstfarge === Farge.Groenn,
      });

      return (
        <Nav.Column className={columnCls} key={Utils._uuid()} xs={kolonne.bredde}>
          {kolonne.innhold}
        </Nav.Column>
      );
    })}
  </Nav.Row>
);

export default Adresserad;
