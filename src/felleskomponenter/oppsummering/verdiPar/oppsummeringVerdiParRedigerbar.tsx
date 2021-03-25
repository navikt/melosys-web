import React from "react";
import PT from "prop-types";

import "./oppsummeringVerdiPar.css";
import OppsummeringVerdiPar from "./oppsummeringVerdiPar";
import * as Ikoner from "../../../resources/images";

interface OppsummeringVerdiParRedigerbarProps {
  nokkel: string;
  verdi: string;
  redigerbart: boolean;
  onClick: Function;
}

const OppsummeringVerdiParRedigerbar = (props: OppsummeringVerdiParRedigerbarProps) => {
  const { nokkel, verdi, redigerbart, onClick } = props;
  const handleClick = () => (redigerbart ? onClick() : null);

  return (
    <span
      role="button"
      className={redigerbart ? "oppsummering_verdi_par redigerbar" : "oppsummering_verdi_par ikke_redigerbar"}
      onClick={handleClick}
      onKeyDown={handleClick}
      tabIndex={0}
    >
      <OppsummeringVerdiPar nokkel={nokkel} verdi={verdi} />
      {redigerbart ? <Ikoner.BlyantActive className="blyant" /> : <Ikoner.BlyantDisabled className="blyant" />}
    </span>
  );
};

OppsummeringVerdiParRedigerbar.defaultProps = {
  nokkel: "",
  redigerbart: true,
};

OppsummeringVerdiParRedigerbar.propTypes = {
  nokkel: PT.string,
  verdi: PT.string.isRequired,
  redigerbart: PT.bool,
  onClick: PT.func.isRequired,
};

export default OppsummeringVerdiParRedigerbar;
