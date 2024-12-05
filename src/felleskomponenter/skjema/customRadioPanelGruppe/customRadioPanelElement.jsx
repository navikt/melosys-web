import { Fragment } from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "./customRadioPanelGruppe.css";

function CustomRadioPanelElement({ tittel, hoyreSideTittel, data }) {
  return (
    <div className="customRadioPanelElement">
      <div className="customRadioPanelTittel">
        <Nav.Heading size="xsmall">{tittel}</Nav.Heading>
        {hoyreSideTittel && hoyreSideTittel}
      </div>
      <dl>
        {data.map(({ term, description }) => {
          if (!description) return null;

          return (
            <Fragment key={Utils._uuid()}>
              <dt>{term}</dt>
              <dd>{description}</dd>
            </Fragment>
          );
        })}
      </dl>
    </div>
  );
}

CustomRadioPanelElement.propTypes = {
  tittel: PT.node,
  hoyreSideTittel: PT.node,
  data: PT.arrayOf(
    PT.shape({
      term: PT.string,
      description: PT.node,
    }),
  ).isRequired,
};

CustomRadioPanelElement.defaultProps = {
  tittel: undefined,
  hoyreSideTittel: undefined,
};

export default CustomRadioPanelElement;
