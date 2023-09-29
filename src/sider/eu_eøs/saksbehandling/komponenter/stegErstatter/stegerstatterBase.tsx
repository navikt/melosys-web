import parse from "html-react-parser";

import * as Nav from "../../../../../navFrontend";

import "./stegerstatterBase.css";

interface StegerstatterBaseProps {
  tittel: string;
  beskrivelse: string;
}

const StegerstatterBase = ({ tittel, beskrivelse }: StegerstatterBaseProps) => (
  <section className="panelSeksjon stegerstatter">
    <Nav.Panel>
      <Nav.Row>
        <Nav.Typo.Systemtittel>{tittel}</Nav.Typo.Systemtittel>
      </Nav.Row>
      <p>{parse(beskrivelse)}</p>
    </Nav.Panel>
  </section>
);

export default StegerstatterBase;
