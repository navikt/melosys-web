import React from "react";
import PT from "prop-types";

import * as Nav from "../../../../../navFrontend";

import "./stegerstatterBase.css";

const StegerstatterBase = ({ tittel, beskrivelse }) => (
  <section className="panelSeksjon stegerstatter">
    <Nav.Panel>
      <Nav.Row>
        <Nav.Typo.Systemtittel>{tittel}</Nav.Typo.Systemtittel>
      </Nav.Row>
      <p>{beskrivelse}</p>
    </Nav.Panel>
  </section>
);

StegerstatterBase.propTypes = {
  tittel: PT.string.isRequired,
  beskrivelse: PT.string.isRequired,
};

export default StegerstatterBase;
