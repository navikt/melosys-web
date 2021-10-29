import React from "react";

import * as Nav from "../../../../../navFrontend";

import { FoedestedOgLand } from "./types";

interface UtfyltFoedestedProps {
  foedestedOgLand: FoedestedOgLand;
}

const Utfyltfoedestedogland = ({ foedestedOgLand }: UtfyltFoedestedProps) => (
  <>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Typo.Normaltekst>Fødested</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="6">
        <Nav.Typo.Normaltekst>Fødeland</Nav.Typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
    {foedestedOgLand && (
      <Nav.Row>
        <Nav.Column xs="6">
          <Nav.Typo.Element>{foedestedOgLand.foedested}</Nav.Typo.Element>
        </Nav.Column>
        <Nav.Column xs="6">
          <Nav.Typo.Element>{foedestedOgLand.foedeland}</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
    )}
  </>
);

export default Utfyltfoedestedogland;
