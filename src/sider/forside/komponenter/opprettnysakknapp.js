import React from "react";
import PT from "prop-types";

import * as Mui from "../../../felleskomponenter/ui";
import * as Ikoner from "../../../resources/images";

import "./opprettnysakknapp.css";

const OpprettNySakKnapp = ({ onClick }) => (
  <div className="opprettNySak">
    <Mui.Knapp onClick={onClick} type="hoved" ikon={Ikoner.AddOneWhite}>
      Opprett ny sak/behandling
    </Mui.Knapp>
  </div>
);

OpprettNySakKnapp.propTypes = {
  onClick: PT.func.isRequired,
};

export default OpprettNySakKnapp;
