import React from "react";
import PT from "prop-types";
import * as Nav from "../../navFrontend";
import "./panelHeader.css";

const PanelHeader = ({ ikon: Ikon, tittel, tittelTilleggsinfo, undertittel }) => (
  <div className="panelheader">
    {Ikon && <Ikon className="panelheader__ikon" />}
    <div className="panelheader__tittel">
      <div className="panelheader__tittel__hoved">
        <Nav.Typo.Undertittel>{tittel}</Nav.Typo.Undertittel>&emsp;
        <Nav.Typo.Ingress>{tittelTilleggsinfo}</Nav.Typo.Ingress>
      </div>
      <span className="panelheader__tittel__under">{undertittel}</span>
    </div>
  </div>
);

PanelHeader.propTypes = {
  tittel: PT.elementType.isRequired,
  tittelTilleggsinfo: PT.string,
  ikon: PT.elementType,
  undertittel: PT.oneOfType([PT.string, PT.node]),
};

PanelHeader.defaultProps = {
  ikon: null,
  tittelTilleggsinfo: "",
  undertittel: "",
};

export default PanelHeader;
