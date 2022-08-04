import React, { Fragment } from "react";
import classnames from "classnames";
import * as Nav from "../navFrontend";

import "./navnOgHjelpetekst.css";

type NavnOgHjelpetekstProps = {
  navn: string;
  hjelpetekst: string;
  type?: Nav.PopoverOrientering;
  className?: string;
};

const NavnOgHjelpetekst = ({
  navn,
  hjelpetekst,
  type = Nav.PopoverOrientering.Hoyre,
  className,
}: NavnOgHjelpetekstProps) => (
  <Fragment>
    {navn}
    <Nav.Hjelpetekst
      tittel={hjelpetekst}
      type={type}
      className={classnames("navnOgHjelpetekst__hjelpetekst", className)}
    >
      {hjelpetekst}
    </Nav.Hjelpetekst>
  </Fragment>
);

export default NavnOgHjelpetekst;
