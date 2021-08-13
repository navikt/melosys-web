import React from "react";

import * as Nav from "../../../../../utils/navFrontend";

interface HistoriskeStatsborgerskapHeaderProps {
  className?: string;
}

const HistoriskeStatsborgerskapHeader = ({ className }: HistoriskeStatsborgerskapHeaderProps) => (
  <Nav.Row className={className}>
    <Nav.Column xs="10" />
    <Nav.Column xs="2">
      <Nav.Typo.Element>Gyldig f.o.m.- t.o.m.</Nav.Typo.Element>
    </Nav.Column>
  </Nav.Row>
);

export default HistoriskeStatsborgerskapHeader;
