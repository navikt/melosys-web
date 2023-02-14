import React from "react";
import PT from "prop-types";
import classnames from "classnames";

import * as Nav from "../../navFrontend";

import "./stegFane.css";

// Stegfanen er komponenten som vises for hvert steg
const StegFane = (props) => {
  const { faneData } = props;
  const componentProps = {
    ...faneData.data,
    ...faneData.handlers,
    aktivtSteg: faneData.aktivtSteg,
    ...faneData.komponentProps,
  };
  const stegFaneKlasse = classnames({
    stegFane: true,
    [`steg${faneData.stegPosisjon}`]: true,
    "stegFane--aktiv": faneData.aktivtSteg,
  });
  return (
    <Nav.Panel className={stegFaneKlasse}>
      <div id={props.id}>{React.createElement(faneData.komponent, componentProps)}</div>
    </Nav.Panel>
  );
};

StegFane.propTypes = {
  faneData: PT.object.isRequired,
  id: PT.string.isRequired,
};

export default StegFane;
