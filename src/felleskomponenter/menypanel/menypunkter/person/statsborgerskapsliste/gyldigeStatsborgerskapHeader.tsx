import React from "react";

import * as Nav from "../../../../../utils/navFrontend";

interface GyldigeStatsborgerskapHeaderProps {
  className?: string;
}

const GyldigeStatsborgerskapHeader = ({ className }: GyldigeStatsborgerskapHeaderProps) => (
  <Nav.Row className={className}>
    <Nav.Column xs="2">
      <Nav.Typo.Element>Land</Nav.Typo.Element>
    </Nav.Column>
    <Nav.Column xs="2">
      <Nav.Typo.Element>Register</Nav.Typo.Element>
    </Nav.Column>
    <Nav.Column xs="3">
      <Nav.Typo.Element>Kilde</Nav.Typo.Element>
    </Nav.Column>
    <Nav.Column xs="3">
      <Nav.Typo.Element>Bekreftelsesdato</Nav.Typo.Element>
    </Nav.Column>
    <Nav.Column xs="2">
      <Nav.Typo.Element>Gyldig f.o.m.</Nav.Typo.Element>
    </Nav.Column>
  </Nav.Row>
);

export default GyldigeStatsborgerskapHeader;
