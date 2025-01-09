import { ReactNode } from "react";
import PT from "prop-types";

import classNames from "classnames";
import "./oppsummeringVerdiPar.css";

interface OppsummeringVerdiParProps {
  className: string;
  nokkel: string;
  verdi: ReactNode;
  ekstrafelt: ReactNode;
}

function OppsummeringVerdiPar(props: OppsummeringVerdiParProps) {
  const { className, nokkel, verdi, ekstrafelt } = props;

  return (
    <dl className={classNames("oppsummering_verdi_par", className)}>
      <dt className="nokkel">{nokkel ? `${nokkel}: ` : ""}</dt>
      <dd>{verdi}</dd>
      {ekstrafelt}
    </dl>
  );
}

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
