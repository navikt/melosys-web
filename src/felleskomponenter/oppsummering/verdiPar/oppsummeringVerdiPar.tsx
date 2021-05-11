import React, { ReactNode } from "react";
import PT from "prop-types";

import classNames from "classnames";
import "./oppsummeringVerdiPar.css";

interface OppsummeringVerdiParProps {
  className: string;
  nokkel: string;
  verdi: string;
  ekstrafelt: ReactNode;
}

const OppsummeringVerdiPar = (props: OppsummeringVerdiParProps) => {
  const { className, nokkel, verdi, ekstrafelt } = props;

  return (
    <span className={classNames("oppsummering_verdi_par", className)}>
      <span className="nokkel">{nokkel ? `${nokkel}: ` : ""}</span>
      <span>{verdi}</span>
      {ekstrafelt}
    </span>
  );
};

OppsummeringVerdiPar.defaultProps = {
  className: "",
  ekstrafelt: undefined,
};

OppsummeringVerdiPar.propTypes = {
  className: PT.string,
  nokkel: PT.string.isRequired,
  verdi: PT.string.isRequired,
  ekstrafelt: PT.node,
};

export default OppsummeringVerdiPar;
