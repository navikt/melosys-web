import React, { Fragment } from "react";
import classnames from "classnames";
import * as Nav from "../navFrontend";

import "./labelMedHjelpetekst.css";

type LabelMedHjelpetekstProps = {
  label: string;
  hjelpetekst: string;
  type?: Nav.PopoverOrientering;
  className?: string;
};

const LabelMedHjelpetekst = ({
  label,
  hjelpetekst,
  type = Nav.PopoverOrientering.Hoyre,
  className,
}: LabelMedHjelpetekstProps) => (
  <Fragment>
    {label}
    <Nav.Hjelpetekst
      tittel={hjelpetekst}
      type={type}
      className={classnames("labelMedHjelpetekst__hjelpetekst", className)}
    >
      {hjelpetekst}
    </Nav.Hjelpetekst>
  </Fragment>
);

export default LabelMedHjelpetekst;
