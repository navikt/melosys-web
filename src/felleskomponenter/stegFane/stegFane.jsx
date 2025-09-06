import { createElement } from "react";
import PT from "prop-types";
import classnames from "classnames";

import "./stegFane.less";

// Stegfanen er komponenten som vises for hvert steg
function StegFane(props) {
  const { id, faneData, rest = {} } = props;
  const componentProps = {
    ...faneData.data,
    ...faneData.handlers,
    aktivtSteg: faneData.aktivtSteg,
    ...rest,
  };
  const stegFaneKlasse = classnames({
    stegFane: true,
    [`steg${faneData.stegPosisjon}`]: true,
    "stegFane--aktiv": faneData.aktivtSteg,
  });
  return (
    <div className={`panel ${stegFaneKlasse}`}>
      <div id={id}>{createElement(faneData.komponent, componentProps)}</div>
    </div>
  );
}

StegFane.propTypes = {
  faneData: PT.object.isRequired,
  id: PT.string.isRequired,
  rest: PT.object,
};

export default StegFane;
