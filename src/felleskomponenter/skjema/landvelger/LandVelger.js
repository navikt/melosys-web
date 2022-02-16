import React from "react";
import { connect } from "react-redux";
import PT from "prop-types";

import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";
import { landkoderSelectors } from "../../../ducks/landkoder";
import EnkeltLand from "./enkeltLand";
import MultiLand from "./multiLand";

import { lagDatalistID } from "./utils";

import "./landvelger.css";

const mapStateToProps = (state) => ({
  landkoderFraSakstype: landkoderSelectors.LandkoderFraSakstypeSelector(state),
  landkoder: landkoderSelectors.LandkoderSelector(state),
});

const connector = connect(mapStateToProps);

/** Dette er inngangskomponent for MultiLand eller EnkeltLand. Disse avgjøres via
 * prop-type multiLand som er subkomponenter i landvelgeren.
 * @param props
 */
export const LandVelger = (props) => {
  const { multiLand, landkoder, landkoderFraSakstype, visAlleLandkoder } = props;
  const dataListID = lagDatalistID();
  const landkodeliste = visAlleLandkoder ? landkoder : landkoderFraSakstype;

  return (
    <div>
      {multiLand ? (
        <MultiLand {...props} landkoder={landkodeliste} dataListID={dataListID} />
      ) : (
        <EnkeltLand {...props} landkoder={landkodeliste} dataListID={dataListID} />
      )}
      <div className="landliste__dataliste">
        <datalist id={dataListID}>
          {landkodeliste.map((item) => (
            <option key={item.kode} value={Utils.land.landTekstFormat(item)} />
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
  landkoderFraSakstype: PT.arrayOf(MPT.Kodeverk).isRequired,
  visAlleLandkoder: PT.bool,
};

LandVelger.defaultProps = {
  disabled: false,
  multiLand: false,
  label: undefined,
  bredde: "XL",
  placeholder: undefined,
  landkoder: undefined,
  visAlleLandkoder: false,
};

export default connector(LandVelger);
