import React from "react";
import classnames from "classnames";
import * as Nav from "../../navFrontend";

import "./labelMedHjelpetekst.css";

type LabelMedHjelpetekstProps = {
  label: string;
  hjelpetekst?: string;
  type?: Nav.PopoverOrientering;
  className?: string;
  hjelpetekstClassName?: string;
};

const LabelMedHjelpetekst = ({
  label,
  hjelpetekst,
  type = Nav.PopoverOrientering.Hoyre,
  className,
  hjelpetekstClassName,
}: LabelMedHjelpetekstProps) => (
  <div className={classnames(className)}>
    {label}
    {hjelpetekst && (
      <Nav.Hjelpetekst
        tittel={hjelpetekst}
        type={type}
        className={classnames("labelMedHjelpetekst__hjelpetekst", hjelpetekstClassName)}
      >
        {hjelpetekst}
      </Nav.Hjelpetekst>
    )}
  </div>
);

export default LabelMedHjelpetekst;
