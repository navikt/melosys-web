import React from "react";
import PT from "prop-types";
import classNames from "classnames";

import * as Nav from "../../utils/navFrontend";

import "./undertittel.css";

const Undertittel = ({ ikon: Ikon, tekst, etterTekst, className, understrek }) => {
  const cl = classNames("undertittel", className);
  const navUndertittelCl = classNames({ understrek }, "navUndertittel");

  return (
    <div className={cl}>
      <Nav.Typo.Undertittel className={navUndertittelCl}>
        {Ikon && <Ikon className="ikon" />}
        <span className="tekst">{tekst}</span>
        <span>{etterTekst}</span>
      </Nav.Typo.Undertittel>
    </div>
  );
};

Undertittel.propTypes = {
  ikon: PT.elementType,
  tekst: PT.string.isRequired,
  etterTekst: PT.node,
  className: PT.string,
  understrek: PT.bool,
};

Undertittel.defaultProps = {
  ikon: undefined,
  className: undefined,
  understrek: false,
  etterTekst: undefined,
};

export default Undertittel;
