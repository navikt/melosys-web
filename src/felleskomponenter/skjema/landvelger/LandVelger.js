import React from "react";
import PT from "prop-types";

import MKV from "../../../melosyskodeverk";
import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";
import EnkeltLand from "./enkeltLand";
import MultiLand from "./multiLand";

import { lagDatalistID } from "./utils";

import "./landvelger.css";

/** Dette er inngangskomponent for MultiLand eller EnkeltLand. Disse avgjøres via
 * prop-type multiLand som er subkomponenter i landvelgeren.
 * @param props
 */
const LandVelger = (props) => {
  const { multiLand, className = "" } = props;
  const dataListID = lagDatalistID();

  return (
    <div className={className}>
      {multiLand ? (
        <MultiLand {...props} landkoder={props.landkoder} dataListID={dataListID} />
      ) : (
        <EnkeltLand {...props} landkoder={props.landkoder} dataListID={dataListID} />
      )}
      <div className="landliste__dataliste">
        <datalist id={dataListID}>
          {props.landkoder.map((item) => (
            <option key={item.kode} value={Utils.land.landTekstFormat(item)} label={Utils.land.landTekstFormat(item)} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

LandVelger.propTypes = {
  disabled: PT.bool,
  feltNavn: PT.string.isRequired,
  multiLand: PT.bool,
  label: PT.node,
  bredde: PT.string,
  placeholder: PT.string,
  landkoder: PT.arrayOf(MPT.Kodeverk),
  className: PT.string,
};

LandVelger.defaultProps = {
  disabled: false,
  multiLand: false,
  label: undefined,
  bredde: "XL",
  placeholder: undefined,
  landkoder: MKV.KTObjects.landkoder,
  className: "",
};

export default LandVelger;
