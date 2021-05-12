import React from "react";
import PT from "prop-types";
import classNames from "classnames";

import * as Nav from "../../utils/navFrontend";

import "./elementskrift.css";

const Elementskrift = ({ ikon: Ikon, tekst, className }) => {
  const cl = classNames("elementskrift", className);

  return (
    <Nav.Typo.Element className={cl}>
      <Ikon className="ikon" />
      {tekst}
    </Nav.Typo.Element>
  );
};

Elementskrift.propTypes = {
  ikon: PT.elementType.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};
Elementskrift.defaultProps = {
  className: undefined,
};

export default Elementskrift;
