import * as Nav from "../../../../../navFrontend";

import "./beskrivelse.less";

interface BeskrivelseProps {
  label: string;
  tekst?: string | null;
  className?: string;
}

function Beskrivelse({ label, tekst, className }: BeskrivelseProps) {
  return (
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
}

export default Beskrivelse;
