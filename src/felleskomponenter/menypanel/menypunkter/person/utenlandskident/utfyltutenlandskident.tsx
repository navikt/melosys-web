import React from "react";

import * as Nav from "../../../../../navFrontend";

import { UtenlandskIdent } from "./types";

interface UtfyltUtenlandskIdentProps {
  utenlandskeIdenter: UtenlandskIdent[];
}

const UtfyltUtenlandskIdent = ({ utenlandskeIdenter }: UtfyltUtenlandskIdentProps) => (
  <>
    <Nav.Row>
      <Nav.Column xs="6">
        <Nav.Typo.Normaltekst>ID-nummer</Nav.Typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="6">
        <Nav.Typo.Normaltekst>Land</Nav.Typo.Normaltekst>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      {utenlandskeIdenter.map(({ ident, landkode }, indeks) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <div key={indeks}>
          <Nav.Column xs="6">
            <Nav.Typo.Element>{ident}</Nav.Typo.Element>
          </Nav.Column>
          <Nav.Column xs="6">{landkode && <Nav.Typo.Element>{landkode}</Nav.Typo.Element>}</Nav.Column>
        </div>
      ))}
    </Nav.Row>
  </>
);

export default UtfyltUtenlandskIdent;
