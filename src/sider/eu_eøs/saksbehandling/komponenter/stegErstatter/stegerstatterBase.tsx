import parse from "html-react-parser";

import * as Nav from "../../../../../navFrontend";

import "./stegerstatterBase.css";

interface StegerstatterBaseProps {
  tittel: string;
  beskrivelse: string;
}

function StegerstatterBase({ tittel, beskrivelse }: StegerstatterBaseProps) {
  return (
    <section className="panelSeksjon stegerstatter">
      <div className="panel">
        <Nav.Row>
          <Nav.Heading size="small">{tittel}</Nav.Heading>
        </Nav.Row>
        <p>{parse(beskrivelse)}</p>
      </div>
    </section>
  );
}

export default StegerstatterBase;
