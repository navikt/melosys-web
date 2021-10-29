import React from "react";
import PT from "prop-types";

import * as Nav from "../navFrontend";
import * as KV from "../kodeverk";

import "./begrunnelser.css";

const Begrunnelser = ({ label, valgteBegrunnelser, muligeBegrunnelser, fritekst }) => (
  <div className="begrunnelser">
    <Nav.Typo.Element className="begrunnelseTittel">{label}</Nav.Typo.Element>
    {valgteBegrunnelser.map((begrunnelse) => (
      <div className="begrunnelse" key={begrunnelse}>
        {KV.kodeTilTerm(begrunnelse, muligeBegrunnelser)}
      </div>
    ))}
    {fritekst && <div className="begrunnelse">{fritekst}</div>}
  </div>
);

Begrunnelser.propTypes = {
  label: PT.string.isRequired,
  valgteBegrunnelser: PT.array,
  muligeBegrunnelser: PT.array,
  fritekst: PT.string,
};

Begrunnelser.defaultProps = {
  valgteBegrunnelser: [],
  muligeBegrunnelser: [],
  fritekst: "",
};

export default Begrunnelser;
