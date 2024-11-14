import * as Nav from "../../../../../navFrontend";

import "./beskrivelse.css";

interface BeskrivelseProps {
  label: string;
  tekst?: string | null;
  className?: string;
}

const Beskrivelse = ({ label, tekst, className }: BeskrivelseProps) => (
  <Nav.Row className={className}>
    <Nav.Column xs="10">
      <div className="ovrig-om-arbeidstaker__beskrivelse">
        <Nav.BodyLong weight="semibold" size="small">
          {label}
        </Nav.BodyLong>
        <Nav.BodyLong size="small" className="tekst">
          {tekst || "-"}
        </Nav.BodyLong>
      </div>
    </Nav.Column>
  </Nav.Row>
);

export default Beskrivelse;
