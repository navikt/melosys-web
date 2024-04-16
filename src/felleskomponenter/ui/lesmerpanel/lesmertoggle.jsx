import PT from "prop-types";
import classNames from "classnames";
import "./lesmerpanel.css";
import * as Ikoner from "../../../resources/images";

const LesMerToggle = ({ erApen, onClick, lukkTekst, apneTekst, other }) => {
  const btnClassName = classNames("lesMerPanel__togglelink", erApen ? "lesMerPanel__togglelink--erApen" : "");

  return (
    <div className="lesMerPanel__toggle">
      <button type="button" aria-expanded={erApen} onClick={onClick} className={btnClassName} {...other}>
        <div className="lesMerPanel__toggleTekst">
          {erApen ? lukkTekst : apneTekst}
          {erApen ? <Ikoner.ChevronUp /> : <Ikoner.ChevronDown />}
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
