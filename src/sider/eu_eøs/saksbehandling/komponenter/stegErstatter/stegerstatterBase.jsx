import PT from "prop-types";
import parse from "html-react-parser";

import * as Nav from "../../../../../navFrontend";

import "./stegerstatterBase.css";

const StegerstatterBase = ({ tittel, beskrivelse }) => (
  <section className="panelSeksjon stegerstatter">
    <Nav.Panel>
      <Nav.Row>
        <Nav.Typo.Systemtittel>{tittel}</Nav.Typo.Systemtittel>
      </Nav.Row>
      <p>{parse(beskrivelse)}</p>
    </Nav.Panel>
  </section>
);

StegerstatterBase.propTypes = {
  tittel: PT.string.isRequired,
  beskrivelse: PT.string.isRequired,
};

export default StegerstatterBase;
