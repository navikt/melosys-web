import { ReactNode } from "react";

import classNames from "classnames";
import "./oppsummeringVerdiPar.less";

interface OppsummeringVerdiParProps {
  className?: string;
  nokkel: string;
  verdi: ReactNode;
  ekstrafelt?: ReactNode;
}

function OppsummeringVerdiPar(props: OppsummeringVerdiParProps) {
  const { className = "", nokkel, verdi, ekstrafelt } = props;

  return (
    <dl className={classNames("oppsummering_verdi_par", className)}>
      <dt className="nokkel">{nokkel ? `${nokkel}: ` : ""}</dt>
      <dd>{verdi}</dd>
      {ekstrafelt}
    </dl>
  );
}

export default OppsummeringVerdiPar;
