import React from "react";
import PT from "prop-types";
import classNames from "classnames";
import Chevron from "nav-frontend-chevron";
import "./lesmerpanel.css";

const LesMerToggle = ({ erApen, onClick, lukkTekst, apneTekst, other }) => {
  const btnClassName = classNames("lesMerPanel__togglelink", erApen ? "lesMerPanel__togglelink--erApen" : "");

  return (
    <div className="lesMerPanel__toggle">
      <button type="button" aria-expanded={erApen} onClick={onClick} className={btnClassName} {...other}>
        <div className="lesMerPanel__toggleTekst">
          {erApen ? lukkTekst : apneTekst}
          <Chevron type={erApen ? "opp" : "ned"} className="lesMerPanel__toggleChevron" />
        </div>
      </button>
    </div>
  );
};

LesMerToggle.propTypes = {
  erApen: PT.bool.isRequired,
  onClick: PT.func.isRequired,
  lukkTekst: PT.node.isRequired,
  apneTekst: PT.node.isRequired,
  other: PT.shape(),
};

LesMerToggle.defaultProps = {
  other: {},
};

export default LesMerToggle;
