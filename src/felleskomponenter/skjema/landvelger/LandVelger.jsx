import { connect } from "react-redux";
import PT from "prop-types";

import * as MPT from "../../../proptypes";
import * as Utils from "../../../utils";
import { landkoderSelectors } from "../../../ducks/landkoder";
import EnkeltLand from "./enkeltLand";

import { lagDatalistID } from "./utils";

import "./landvelger.css";

const mapStateToProps = (state) => ({
  landkoderFraSakstype: landkoderSelectors.LandkoderFraSakstypeSelector(state),
  alleLandkoder: landkoderSelectors.LandkoderSelector(state),
});

const connector = connect(mapStateToProps);

/** Dette er inngangskomponent for MultiLand eller EnkeltLand. Disse avgjøres via
 * prop-type multiLand som er subkomponenter i landvelgeren.
 * @param props
 */
function LandVelger(props) {
  const {
    className = "",
    landkoder,
    landkoderFraSakstype,
    alleLandkoder,
    visAlleLandkoder = false,
    dataTestId,
    disabled = false,
    bredde = "XL",
    label,
    placeholder,
    errorConfig,
  } = props;
  const dataListID = lagDatalistID();
  const landkodeliste = landkoder || (visAlleLandkoder ? alleLandkoder : landkoderFraSakstype);

  return (
    <div className={className}>
      <EnkeltLand {...props} landkoder={landkodeliste} dataListID={dataListID} />
      <div className="landliste__dataliste">
        <datalist id={dataListID}>
          {landkodeliste.map((item) => (
            <option key={item.kode} value={Utils.land.landTekstFormat(item)} data-testid={dataTestId}>
              {Utils.land.landTekstFormat(item)}
            </option>
          ))}
        </datalist>
      </div>
    </div>
  );
}

LandVelger.propTypes = {
  disabled: PT.bool,
  feltNavn: PT.string.isRequired,
  label: PT.node,
  bredde: PT.string,
  placeholder: PT.string,
  landkoder: PT.arrayOf(MPT.Kodeverk),
  alleLandkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  landkoderFraSakstype: PT.arrayOf(MPT.Kodeverk).isRequired,
  visAlleLandkoder: PT.bool,
  className: PT.string,
  errorConfig: PT.object,
  dataTestId: PT.string,
};

export default connector(LandVelger);
