import React from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";

import "./avsendervelger.css";

const PreutfyltAvsender = ({ className, avsenderID, avsenderNavn }) => (
  <div className={className}>
    <Nav.Typo.Element className="linje">Avsender ID</Nav.Typo.Element>
    <Nav.Typo.Normaltekst className="linje">{avsenderID}</Nav.Typo.Normaltekst>
    <Nav.Typo.Element className="linje">Avsenders navn</Nav.Typo.Element>
    <Nav.Typo.Normaltekst className="linje">{avsenderNavn}</Nav.Typo.Normaltekst>
  </div>
);

PreutfyltAvsender.propTypes = {
  className: PT.string.isRequired,
  avsenderID: PT.string.isRequired,
  avsenderNavn: PT.string.isRequired,
};
export default PreutfyltAvsender;
