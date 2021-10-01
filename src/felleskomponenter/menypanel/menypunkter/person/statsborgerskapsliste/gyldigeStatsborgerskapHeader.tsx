import React from "react";

import * as Nav from "../../../../../utils/navFrontend";

interface GyldigeStatsborgerskapHeaderProps {
  className?: string;
}

const GyldigeStatsborgerskapHeader = ({ className }: GyldigeStatsborgerskapHeaderProps) => (
  <Nav.Row className={className}>
    <Nav.Column xs="2">
      <Nav.Typo.Normaltekst>Land</Nav.Typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="2">
      <Nav.Typo.Normaltekst>Register</Nav.Typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="3">
      <Nav.Typo.Normaltekst>Kilde</Nav.Typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="3">
      <Nav.Typo.Normaltekst>Bekreftelsesdato</Nav.Typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="2">
      <Nav.Typo.Normaltekst>Gyldig f.o.m.</Nav.Typo.Normaltekst>
    </Nav.Column>
  </Nav.Row>
);

export default GyldigeStatsborgerskapHeader;
